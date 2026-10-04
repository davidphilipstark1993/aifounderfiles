// Weekly newsletter send. Run by .github/workflows/weekly-newsletter-send.yml (Sundays, 08:00 UTC).
//
//   tsx scripts/newsletter/weekly-send.ts                send the oldest APPROVED PDF issue
//   tsx scripts/newsletter/weekly-send.ts --dry-run      report what would be sent, send nothing
//   tsx scripts/newsletter/weekly-send.ts --test         send ONE copy to ADMIN_EMAILS, record nothing
//   tsx scripts/newsletter/weekly-send.ts --resume       finish a send that stopped part-way
//
// Issues are uploaded and approved on the admin page (/admin/). Approving IS the go-ahead for Sunday.
import { adminClient } from '../../lib/newsletter/supabase.js';
import { notifyAdmin } from '../../lib/newsletter/sendgrid.js';
import { MAX_AGE_DAYS, sendIssue, sendTest, type IssueRow } from '../../lib/newsletter/issues.js';

const args = new Set(process.argv.slice(2));
const flag = (name: string) => args.has(`--${name}`);

async function main() {
  const supabase = adminClient();
  const { data, error } = await supabase.from('newsletter_issues').select('*').in('status', ['approved', 'sending', 'failed']).order('approved_at', { ascending: true });
  if (error) throw new Error(`Could not load issues: ${error.message}`);
  const open = (data ?? []) as IssueRow[];

  // An interrupted send blocks everything else until you resume it, so nobody is emailed twice.
  const stuck = open.find((i) => i.status !== 'approved');
  if (stuck && !flag('resume')) {
    const msg = `A previous send of issue #${stuck.issue_number} "${stuck.title}" did not finish (status: ${stuck.status}, ${stuck.sent_count}/${stuck.recipient_count} sent).\n${stuck.error ? `Error: ${stuck.error}\n` : ''}\nNothing was sent now, to avoid emailing anyone twice. Check SendGrid's activity feed, then run the workflow with "resume" ticked (or press Resume on the admin page).`;
    console.error(msg);
    await notifyAdmin('Newsletter NOT sent: previous send incomplete', msg);
    process.exitCode = 1;
    return;
  }

  const issue = flag('resume') ? stuck : open.find((i) => i.status === 'approved');
  if (!issue) {
    const why = flag('resume') ? 'There is no interrupted send to resume.' : 'No issue is approved for sending.';
    console.log(why);
    await notifyAdmin('Newsletter not sent: nothing approved', `${why}\n\nUpload a PDF and approve it at https://aifounderfiles.com/admin/ before Sunday.`);
    return;
  }

  console.log(`Issue #${issue.issue_number}: ${issue.title} (${issue.status})`);

  if (flag('dry-run')) {
    console.log('Dry run: nothing sent or recorded.');
    return;
  }

  if (flag('test')) {
    const n = await sendTest(supabase, issue);
    console.log(`Test copy sent to ${n} admin address(es). Nothing recorded.`);
    return;
  }

  const approvedAt = issue.approved_at ? new Date(issue.approved_at) : new Date(issue.created_at);
  const ageDays = (Date.now() - approvedAt.getTime()) / 86_400_000;
  if (!flag('resume') && ageDays > MAX_AGE_DAYS) {
    const msg = `Issue #${issue.issue_number} "${issue.title}" was approved ${Math.floor(ageDays)} days ago, so it was not emailed automatically.\n\nTo send it anyway, press "Send now" on the admin page.`;
    console.log(msg);
    await notifyAdmin('Newsletter not sent: approval is stale', msg);
    return;
  }

  const result = await sendIssue(issue.id, { resume: flag('resume') });
  console.log(result.message);
  if (!result.ok) {
    process.exitCode = 1;
    if (!/Another send|already sent|no active subscribers/i.test(result.message)) return;
    await notifyAdmin('Newsletter not sent', result.message);
  }
}

main().catch(async (err) => {
  console.error('Weekly newsletter send crashed:', err);
  await notifyAdmin('Newsletter send CRASHED', err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});

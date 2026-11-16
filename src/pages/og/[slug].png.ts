import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedFiles } from '../../lib/files';
import { renderFileOg } from '../../lib/og';

export const getStaticPaths = (async () => {
  const files = await getPublishedFiles();
  return files.map((f) => ({
    params: { slug: f.id },
    // The share image carries the web H1 (founder's name and how they use AI), not the issue title.
    props: { title: f.data.headline ?? f.data.title, fileNumber: f.data.fileNumber },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderFileOg({ title: props.title, fileNumber: props.fileNumber });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

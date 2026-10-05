import Link from 'next/link';

export const metadata = { title: 'Photo credits | Funsival' };

export default function PhotoCreditsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-800">
      <Link href="/" className="text-[#228E8A] underline">Back to Funsival</Link>
      <h1 className="mt-8 mb-6 text-3xl font-bold">Photo credits</h1>
      <p>
        Mau destination photograph: Shree Shitla Mata temple, by{' '}
        <a className="underline" href="https://commons.wikimedia.org/wiki/File:Shitla_mata_temple_mau_UP_india.jpg">Nirajagnivesh</a>,{' '}
        licensed under <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.
        The original photograph is cropped for display in destination cards.
      </p>
    </main>
  );
}

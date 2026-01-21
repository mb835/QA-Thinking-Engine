type Props = {
  title: string;
};

export default function PlaceholderPage({ title }: Props) {
  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-white/60">Již brzy…</p>
    </div>
  );
}

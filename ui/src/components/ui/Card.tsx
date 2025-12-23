type CardProps = {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function Card({ title, icon, children }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {title && (
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          {icon}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

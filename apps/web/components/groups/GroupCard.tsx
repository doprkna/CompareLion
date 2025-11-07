import Link from 'next/link';

interface Props {
  id: string;
  name: string;
  description?: string | null;
  visibility: 'private' | 'public';
  transparency: 'summary' | 'full' | 'hidden';
  role?: string;
}

export function GroupCard({ id, name, description, visibility, transparency, role }: Props) {
  return (
    <div className="rounded border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        {role ? <span className="text-xs text-gray-500">{role}</span> : null}
      </div>
      {description ? <p className="text-sm text-gray-600">{description}</p> : null}
      <div className="text-xs text-gray-500">{visibility} • {transparency}</div>
      <div className="mt-2">
        <Link className="text-blue-600 hover:underline" href={`/groups/${id}`}>Open</Link>
      </div>
    </div>
  );
}



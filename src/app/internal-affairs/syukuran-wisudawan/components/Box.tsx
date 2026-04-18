interface BoxProps {
  id: number;
  wishes: string;
  author: string;
}

export default function Box({ id, wishes, author }: BoxProps) {
  // Mapping the index to Tailwind color combinations
  const colorSchemes: Record<number, string> = {
    0: "bg-red-950 border-red-500",
    1: "bg-green-950 border-green-500",
    2: "bg-yellow-950 border-yellow-500",
    3: "bg-blue-950 border-blue-500",
  };

  const selectedScheme = colorSchemes[id % 4];
  const [bgColor, borderColor] = selectedScheme.split(" ");

  return (
    <div className={`w-full min-h-[180px] p-4 ${bgColor}`}>
      <div className={`w-full h-full border-2 p-4 flex flex-col justify-center items-start gap-5 font-plus-jakarta-sans ${borderColor}`}>
        <p className="text-white">
          &quot;{wishes}&quot;
        </p>
        <p className="text-white font-bold">
          {author}
        </p>
      </div>
    </div>
  );
}
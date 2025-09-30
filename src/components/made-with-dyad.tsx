export const MadeWithDyad = ({ message }: { message?: string }) => {
  const defaultMessage = "Yaarsite for entrepreneurs";
  return (
    <div className="p-4 text-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {message || defaultMessage}
      </span>
    </div>
  );
};
type NotificationProps = {
  notificationText: string;
};

export default function Notification({ notificationText }: NotificationProps) {
  return (
    <div className="w-full bg-[#FFF8E1] border-l-4 border-[#F2994A] py-4 px-7 lg:px-44">
      <div className="flex items-center justify-center">
        <span className="text-amber-700 mr-2 text-xl">🔔</span>
        <p className="text-sm text-[#795548] font-medium">{notificationText}</p>
      </div>
    </div>
  );
}

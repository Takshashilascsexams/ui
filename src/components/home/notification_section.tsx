type NotificationSectionPtopType = {
  notificationText: string;
};

export default function NotificationSection({
  notificationText,
}: NotificationSectionPtopType) {
  return (
    <div className="w-full py-3 relative overflow-hidden whitespace-nowrap bg-[#ffcc00]">
      <p className="text-sm font-medium animate-marquee">
        {notificationText} 🔥
      </p>
    </div>
  );
}

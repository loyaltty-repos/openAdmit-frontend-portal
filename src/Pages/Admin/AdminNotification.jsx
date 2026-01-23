import AdminLogs from "@/components/AdminLogs";

const AdminNotification = () => {
  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      <div className="">
        <AdminLogs limit={10} enablePagination/>
      </div>
    </div>
  );
};

export default AdminNotification;

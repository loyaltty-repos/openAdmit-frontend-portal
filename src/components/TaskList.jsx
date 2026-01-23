import { AlignLeft, FileText, ExternalLink } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getStudentUpcomingTasks } from '@/services/dashboardService';
import { useNavigate } from 'react-router-dom';
import { useNotificationSocket } from '@/hooks/NotificationSocketContext';

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // silent refresh state (so UI doesn't show continuous loading)
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [documentsMeta, setDocumentsMeta] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    limit: 10
  });

  const navigate = useNavigate();

  // ✅ socket tick (used by stats/userlogs as well)
  const { refreshTick } = useNotificationSocket();

  // ✅ reusable fetch that supports silent refresh
  const fetchUpcoming = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        const response = await getStudentUpcomingTasks({
          page: pagination.page,
          limit: pagination.limit
        });

        if (response?.success) {
          const data = response.data || {};

          const formattedTasks = (data.upcomingTasks || []).map((task) => ({
            id: task._id,
            name: task.title,
            category: task.priority || 'NORMAL',
            deadline: task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('en-GB')
              : 'No deadline',
          }));

          const formattedDocs = (data.upcomingDocuments || []).map((doc) => ({
            id: doc._id,
            name: doc.documentName || 'Untitled',
            url: doc.documentURL || '',
            priority: doc.priority || 'MEDIUM',
            deadline: doc.dueDate
              ? new Date(doc.dueDate).toLocaleDateString('en-GB')
              : 'No deadline',
            status: doc.status || 'DRAFT',
          }));

          setTasks(formattedTasks);
          setDocuments(formattedDocs);

          setPagination({
            page: data.currentPage || 1,
            limit: data.limit || 10,
            total: data.total || 0,
            totalPages: data.pages || 1,
          });

          setDocumentsMeta({
            total: data.documentsMeta?.total ?? (data.upcomingDocuments?.length || 0),
            pages: data.documentsMeta?.pages ?? 1,
            currentPage: data.documentsMeta?.currentPage ?? 1,
            limit: data.documentsMeta?.limit ?? 10,
          });
        }
      } catch (error) {
        console.error('Error fetching upcoming tasks/documents:', error);
      } finally {
        if (!silent) setIsLoading(false);
        else setIsRefreshing(false);
      }
    },
    [pagination.page, pagination.limit]
  );

  // ✅ existing behavior: fetch on page/limit change
  useEffect(() => {
    fetchUpcoming({ silent: false });
  }, [fetchUpcoming]);

  // ✅ NEW: refetch silently when ANY notification arrives (task/university/doc etc.)
  // This makes Tasks/University widgets update like Stats & UserLogs without manual refresh.
  useEffect(() => {
    if (!refreshTick) return;

    const t = setTimeout(() => {
      fetchUpcoming({ silent: true });
    }, 250); // small debounce

    return () => clearTimeout(t);
  }, [refreshTick, fetchUpcoming]);

  const hasAnyData = tasks.length > 0 || documents.length > 0;

  const CountPill = ({ label, value }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
      <span className="font-medium">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </span>
  );

  const SectionHeader = ({ title, count }) => (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <span className="text-[11px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">
          {count}
        </span>
      </div>

      <button
        type="button"
        className="text-xs font-medium text-primary hover:underline cursor-pointer"
        onClick={() => navigate('/dashboard/checklist')} // optional
      >
        View all
      </button>
    </div>
  );

  return (
    <div className="rounded-md bg-white ">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            Assignments
          </h3>
          <div className="hidden sm:flex items-center gap-2">
            <CountPill label="Tasks" value={pagination.total || tasks.length} />
            <CountPill label="Docs" value={documentsMeta.total || documents.length} />
          </div>
        </div>

        {/* Optional small subtle refresh hint (not required)
            We keep it hidden by default to avoid “continuous loading” look */}
        {/* {isRefreshing && <span className="text-xs text-gray-400">Updating…</span>} */}
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-solid" />
        </div>
      )}

      {/* Content */}
      {(hasAnyData || isLoading) && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
          {/* TASKS PANEL */}
          <div className="rounded-md border border-gray-100 bg-white p-3">
            <SectionHeader title="Upcoming Tasks" count={tasks.length} />

            {tasks.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-xs border-b border-gray-100">
                        <th className="py-2 pr-3">Task</th>
                        <th className="py-2 pr-3">Priority</th>
                        <th className="py-2 pr-3">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-b border-gray-50">
                          <td className="py-2 pr-3 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <AlignLeft className="w-4 h-4 text-gray-400" />
                              {task.name}
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-xs">
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                              {task.category}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-xs text-gray-600">
                            {task.deadline}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile list */}
                <div className="md:hidden space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-md border border-gray-100 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {task.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Deadline: {task.deadline}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              !isLoading && (
                <div className="rounded-md bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
                  No upcoming tasks.
                </div>
              )
            )}
          </div>

          {/* DOCUMENTS PANEL */}
          <div className="rounded-md border border-gray-100 bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  Upcoming Documents
                </p>
                <span className="text-[11px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">
                  {documents.length}
                </span>
              </div>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-md border border-gray-100 p-3 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[11px] rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                            {doc.priority}
                          </span>
                          <span className="text-[11px] rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                            {doc.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Deadline: {doc.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="rounded-md bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
                  No upcoming documents.
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksList;

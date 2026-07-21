import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Clock,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  User,
  Package,
  FileCheck,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { auditLogAPI } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...filters,
      };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await auditLogAPI.getAll(params);
      setLogs(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // Show sample data if API not available
      setLogs([
        {
          id: '1',
          action: 'CREATE',
          entity_type: 'barang',
          entity_id: 'abc-123',
          user: { nama: 'Petugas KRL', email: 'petugas.krl@kai.id' },
          created_at: new Date().toISOString(),
          ip_address: '192.168.1.1',
        },
        {
          id: '2',
          action: 'UPDATE',
          entity_type: 'klaim',
          entity_id: 'klm-456',
          user: { nama: 'Admin Pusat', email: 'admin@kai.id' },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          ip_address: '192.168.1.2',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-700';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEntityIcon = (entity_type) => {
    switch (entity_type) {
      case 'barang':
        return <Package className="h-4 w-4" />;
      case 'klaim':
        return <FileCheck className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Log Aktivitas</h1>
            <p className="text-gray-500">Riwayat semua aktivitas sistem</p>
          </div>
          <button onClick={fetchLogs} className="btn-outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.action}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, action: e.target.value }));
                setPage(1);
              }}
              className="input w-auto"
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
            <select
              value={filters.entity_type}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, entity_type: e.target.value }));
                setPage(1);
              }}
              className="input w-auto"
            >
              <option value="">Semua Entity</option>
              <option value="barang">Barang</option>
              <option value="klaim">Klaim</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionBadge(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          {getEntityIcon(log.entity_type)}
                          {log.entity_type}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm font-mono text-gray-500">
                          ID: {log.entity_id?.substring(0, 8)}...
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user?.nama || 'System'}
                        </span>
                        <span>{log.user?.email}</span>
                        <span>{log.ip_address}</span>
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        {formatDateTime(log.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Halaman {page} dari {pagination.totalPages} ({pagination.total} aktivitas)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost px-3 py-1"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="btn-ghost px-3 py-1"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Loader2, Bell, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { notifikasiAPI } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  const fetchNotifikasi = async () => {
    try {
      const res = await notifikasiAPI.getAll();
      setNotifikasi(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    setActionLoading(id);
    try {
      await notifikasiAPI.markRead(id);
      setNotifikasi(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      toast.success('Notifikasi ditandai sudah dibaca');
    } catch (error) {
      toast.error('Gagal menandai notifikasi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('all');
    try {
      await notifikasiAPI.markAllRead();
      setNotifikasi(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (error) {
      toast.error('Gagal menandai semua notifikasi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await notifikasiAPI.delete(id);
      setNotifikasi(prev => prev.filter(n => n.id !== id));
      toast.success('Notifikasi dihapus');
    } catch (error) {
      toast.error('Gagal menghapus notifikasi');
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-700';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-700';
      case 'ERROR':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const unreadCount = notifikasi.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : 'Semua notifikasi sudah dibaca'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={actionLoading === 'all'}
            className="btn-outline flex items-center gap-2"
          >
            {actionLoading === 'all' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Notifikasi List */}
      {notifikasi.length > 0 ? (
        <div className="space-y-2">
          {notifikasi.map((item) => (
            <div
              key={item.id}
              className={`card p-4 flex items-start gap-4 ${
                !item.is_read ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                !item.is_read ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Bell className={`h-5 w-5 ${!item.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium ${!item.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {item.judul}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{item.pesan}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(item.type)}`}>
                    {item.type}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!item.is_read && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    disabled={actionLoading === item.id}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600"
                    title="Tandai sudah dibaca"
                  >
                    {actionLoading === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={actionLoading === item.id}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak Ada Notifikasi
          </h3>
          <p className="text-gray-500">
            Anda akan menerima notifikasi ketika ada update terkait klaim Anda
          </p>
        </div>
      )}
    </div>
  );
}

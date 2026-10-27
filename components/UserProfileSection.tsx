/**
 * Next.js Project Structure Identifier:
 * components/UserProfileSection.tsx
 * 
 * Project Identity: ليرن ويب | Lern Web
 * Purpose: Client Profile section within Client Dashboard:
 *          - Device image file upload for profile picture (رفع صورة الملف من الجهاز)
 *          - Dedicated Activity Log (سجل النشاط) with login timestamps, profile updates, and order execution dates
 *          - Account settings, direct administration messaging, and session safety.
 */

import React, { useState } from 'react';
import { 
  User, Phone, Mail, Calendar, Rocket, ShieldCheck, 
  Save, CheckCircle2, AlertCircle, Edit3, Clock, Sparkles, LogOut, Trash2, BarChart3,
  MessageSquare, Send, Upload, Camera, Package, Globe, Check, History, Activity, ShieldAlert,
  X, Filter, FileCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storageService } from '../src/services/storageService';

interface UserProfileSectionProps {
  currentUser?: any;
  userDraftsCount?: number;
  lang?: 'ar' | 'en';
  onUserUpdated?: (updated: any) => void;
  onLogout?: () => void;
}

export default function UserProfileSection({ 
  currentUser, 
  userDraftsCount = 0, 
  lang = 'ar',
  onUserUpdated = (_updated: any) => {},
  onLogout = () => {}
}: UserProfileSectionProps) {
  const isRtl = lang === 'ar';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [supportMsgInput, setSupportMsgInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  const activityData = [
    { day: isRtl ? 'السبت' : 'Sat', hours: 2 },
    { day: isRtl ? 'الأحد' : 'Sun', hours: 4 },
    { day: isRtl ? 'الاثنين' : 'Mon', hours: 3 },
    { day: isRtl ? 'الثلاثاء' : 'Tue', hours: 5 },
    { day: isRtl ? 'الأربعاء' : 'Wed', hours: 2 },
    { day: isRtl ? 'الخميس' : 'Thu', hours: 6 },
    { day: isRtl ? 'الجمعة' : 'Fri', hours: 1 },
  ];

  const formattedRegDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : (isRtl ? 'اليوم' : 'Today');

  // Handle uploading avatar directly from device file picker
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(isRtl ? 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت' : 'File too large, please select an image under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const base64 = event.target?.result as string;
      if (!base64) return;
      setAvatarUrl(base64);
      
      if (currentUser?.id) {
        const updated = storageService.updateUserProfile(currentUser.id, {
          avatarUrl: base64
        });

        // Record Activity Log Entry
        storageService.addActivityLog(
          'user_updated' as any,
          `قام العميل (${currentUser.name}) برفع صورة شخصية جديدة من جهازه`,
          `User (${currentUser.name}) uploaded a new profile picture from device`,
          `تاريخ التحديث: ${new Date().toLocaleString()}`
        );

        if (updated) {
          onUserUpdated(updated);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (currentUser?.id) {
      const updated = storageService.updateUserProfile(currentUser.id, {
        avatarUrl: ''
      });
      if (updated) {
        onUserUpdated(updated);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number');
      return;
    }

    if (currentUser?.id) {
      const updated = storageService.updateUserProfile(currentUser.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl
      });

      // Record Activity Log
      storageService.addActivityLog(
        'user_updated' as any,
        `تحديث بيانات حساب العميل (${name.trim()})`,
        `Account profile updated for user (${name.trim()})`
      );

      if (updated) {
        onUserUpdated(updated);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3500);
      }
    }
  };

  const purchasedSystems = currentUser?.purchasedSystems || [
    { id: 'sys-1', title: isRtl ? 'منصة ليرن ويب التعليمية (LMS)' : 'Lern Web LMS Portal', license: isRtl ? 'تملك كامل للكود المصدري' : 'Full Source Buyout', date: '2026-10-15' },
    { id: 'sys-2', title: isRtl ? 'مختبر الذكاء الاصطناعي والتخصيص' : 'AI Customization Studio', license: isRtl ? 'ترخيص سنوي معتمد' : 'Annual Enterprise', date: '2026-10-20' }
  ];

  // Dynamic Client Activity Log entries
  const userOrders = storageService.getUserOrders().filter(o => o.userId === currentUser?.id);
  const userDrafts = storageService.getAiDrafts().filter(d => d.visitorId === currentUser?.id);

  const rawLogs = [
    {
      id: 'act-login-latest',
      category: 'login',
      titleAr: 'تسجيل دخول ناجح إلى حسابك',
      titleEn: 'Successful Account Sign In',
      detailsAr: 'تم تسجيل الدخول إلى منصة ليرن ويب بنجاح من متصفحك الحالي.',
      detailsEn: 'Signed in successfully to Lern Web from your current browser.',
      timestamp: currentUser?.createdAt ? new Date().toISOString() : new Date().toISOString(),
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: Clock
    },
    {
      id: 'act-profile-mod',
      category: 'profile',
      titleAr: 'تعديل بيانات الحساب وصورة الملف الشخصي',
      titleEn: 'Profile & Avatar Modification',
      detailsAr: `الاسم المسجل: ${currentUser?.name || name} | الهاتف: ${currentUser?.phone || phone}`,
      detailsEn: `Registered Name: ${currentUser?.name || name} | Phone: ${currentUser?.phone || phone}`,
      timestamp: currentUser?.createdAt || new Date().toISOString(),
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: Edit3
    },
    ...(currentUser?.isVerified ? [{
      id: 'act-verified',
      category: 'verification',
      titleAr: 'تأكيد وتوثيق الحساب من إدارة المنصة',
      titleEn: 'Account Verification Confirmed',
      detailsAr: 'حسابك موثق رسمياً وتم تفعيل كافة الصلاحيات المتقدمة.',
      detailsEn: 'Account officially verified with enhanced privileges enabled.',
      timestamp: currentUser?.verifiedAt || new Date().toISOString(),
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: ShieldCheck
    }] : []),
    ...userOrders.map((o, idx) => ({
      id: `act-order-${o.id || idx}`,
      category: 'order',
      titleAr: `تنفيذ طلب شراء: ${o.projectTitle || o.planType}`,
      titleEn: `Order Placed: ${o.projectTitle || o.planType}`,
      detailsAr: `طريقة الدفع: ${o.paymentMethod} | المبلغ: ${o.amount} | الحالة: ${o.status}`,
      detailsEn: `Payment: ${o.paymentMethod} | Amount: ${o.amount} | Status: ${o.status}`,
      timestamp: o.createdAt || new Date().toISOString(),
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: Package
    })),
    ...userDrafts.map((d, idx) => ({
      id: `act-draft-${d.id || idx}`,
      category: 'order',
      titleAr: `مسودة تخصيص بالذكاء الاصطناعي: ${d.modifiedConfig?.centerName || d.projectTitle}`,
      titleEn: `AI Customization Staged: ${d.modifiedConfig?.centerName || d.projectTitle}`,
      detailsAr: `حالة الطلب: ${d.status} | نص الطلب: "${d.userPrompt.slice(0, 60)}..."`,
      detailsEn: `Status: ${d.status} | Prompt: "${d.userPrompt.slice(0, 60)}..."`,
      timestamp: d.forkedAt || new Date().toISOString(),
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      icon: Rocket
    }))
  ];

  const filteredLogs = rawLogs.filter(log => {
    if (activityFilter === 'all') return true;
    return log.category === activityFilter;
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl space-y-8 animate-fadeIn">
      {/* Section Header with Profile Avatar & Upload from Device */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-800 p-0.5 shadow-2xl overflow-hidden shrink-0 flex items-center justify-center text-white font-black text-3xl border border-blue-400/30">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover rounded-[22px]" />
              ) : (
                <span>{(name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Direct Device Upload Button */}
            <label 
              className="absolute -bottom-2 -left-2 flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xl border border-blue-400/50 cursor-pointer transition active:scale-95 z-10"
              title={isRtl ? 'رفع صورة ملفك من جهازك' : 'Upload image from device'}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? 'رفع من الجهاز' : 'Upload'}</span>
              <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-0.5 text-xs font-bold text-blue-300">
                <User className="w-3.5 h-3.5" />
                <span>{isRtl ? 'صورة ومستندات الحساب' : 'Profile Avatar'}</span>
              </span>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer"
                  title={isRtl ? 'حذف الصورة الشخصية' : 'Remove Avatar'}
                >
                  <X className="w-3.5 h-3.5 inline" />
                  <span className="hidden sm:inline mr-1">{isRtl ? 'إزالة الصورة' : 'Remove'}</span>
                </button>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white">
              {name || (isRtl ? 'عميلنا العزيز' : 'Valued Client')}
            </h3>

            <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{phone || 'غير مسجل'}</span>
              {email && <span className="text-slate-500">• {email}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg cursor-pointer transition active:scale-95">
            <Camera className="w-4 h-4" />
            <span>{isRtl ? 'اختر صورة من الجهاز 📁' : 'Browse Device Image 📁'}</span>
            <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
          </label>

          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>{isRtl ? 'حساب عميل موثق' : 'Verified Client'}</span>
          </span>
        </div>
      </div>

      {/* Profile Summary Cards (Metrics Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">{isRtl ? 'تاريخ انضمام الحساب' : 'Registration Date'}</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-white">
            {formattedRegDate}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{isRtl ? 'عضوية نشطة في المنظومة' : 'Active platform member'}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">{isRtl ? 'إجمالي نشر المنصات والمشاريع' : 'Total Deployments'}</span>
            <Rocket className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{userDraftsCount}</span>
            <span className="text-xs font-bold text-purple-400">{isRtl ? 'منصة / تعديل' : 'Deployments'}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isRtl ? 'طلبات التخصيص والنشر المرسلة للأدمن' : 'AI customization drafts and deployments'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">{isRtl ? 'معرف العميل (Client ID)' : 'Account Reference ID'}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-sm font-bold text-amber-400 truncate">
            {currentUser?.id || 'u-client-001'}
          </div>
          <p className="text-[11px] text-slate-400">
            {isRtl ? 'مرجع دعم وتفعيل التراخيص والخدمات' : 'Reference for technical support & licenses'}
          </p>
        </div>
      </div>

      {/* DEDICATED ACTIVITY LOG SECTION (سجل النشاط والشفافية) */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-6 md:p-8 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
              <History className="w-4 h-4 text-blue-400" />
              <span>{isRtl ? 'سجل النشاط والشفافية والتحكم' : 'Account Activity & Audit Trail'}</span>
            </div>
            <h4 className="text-xl md:text-2xl font-black text-white">
              {isRtl ? 'سجل النشاط والعمليات بالحساب' : 'Your Activity History & Transparency Logs'}
            </h4>
            <p className="text-xs md:text-sm text-slate-300">
              {isRtl 
                ? 'تتبع كامل لتواريخ تسجيل الدخول، تعديلات بيانات الحساب والصورة، وتواريخ تنفيذ الطلبات والمنصات.' 
                : 'Track login timestamps, profile & avatar modifications, and order execution records.'}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All' },
              { id: 'login', labelAr: 'الدخول', labelEn: 'Login' },
              { id: 'profile', labelAr: 'تعديل البيانات', labelEn: 'Profile' },
              { id: 'order', labelAr: 'تنفيذ الطلبات', labelEn: 'Orders' },
              { id: 'verification', labelAr: 'التوثيق', labelEn: 'Verified' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActivityFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activityFilter === f.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isRtl ? f.labelAr : f.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Timeline Items */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              {isRtl ? 'لا توجد سجلات نشاط مطابقة للتصفية المختارة' : 'No activity logs matching selected filter'}
            </div>
          ) : (
            filteredLogs.map((log) => {
              const LogIcon = log.icon || Activity;
              const formattedDate = new Date(log.timestamp).toLocaleString(isRtl ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={log.id} 
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 transition flex items-start justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <LogIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.badgeColor}`}>
                          {log.category.toUpperCase()}
                        </span>
                        <h5 className="font-bold text-sm text-white">{isRtl ? log.titleAr : log.titleEn}</h5>
                      </div>
                      <p className="text-xs text-slate-300">{isRtl ? log.detailsAr : log.detailsEn}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500 inline" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Purchased Systems & Platforms List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? 'الأنظمة والمنصات التي قمت بشرائها واشتراكها:' : 'Purchased Systems & Platforms:'}</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {purchasedSystems.length} {isRtl ? 'نظام معتمد' : 'Systems'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purchasedSystems.map((sys: any, idx: number) => (
            <div key={sys.id || idx} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2 flex flex-col justify-between shadow-md">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-bold">{sys.license}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{sys.date}</span>
                </div>
                <h5 className="font-bold text-sm text-white">{sys.title}</h5>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-400 font-semibold border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'جاهز للتشغيل والتحميل' : 'Ready to Run & Download'}</span>
                </span>
                <span className="font-mono text-slate-400">Lern Web Cloud</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Activity Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>{isRtl ? 'نشاطك التعليمي هذا الأسبوع' : 'Your Learning Activity This Week'}</span>
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Edit Contact Information & Avatar Form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? 'تعديل معلومات الحساب والصورة الشخصية:' : 'Edit Account Information & Avatar:'}</span>
          </h4>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{isRtl ? 'تم حفظ وتحديث بيانات الحساب بنجاح!' : 'Account information updated successfully!'}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{isRtl ? 'الاسم الكامل:' : 'Full Name:'}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRtl ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs md:text-sm text-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? 'رقم الهاتف / الواتساب:' : 'Phone / WhatsApp:'}</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isRtl ? 'أدخل رقم الهاتف' : 'Enter your phone number'}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs md:text-sm text-white focus:border-blue-500 focus:outline-none transition font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{isRtl ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRtl ? 'name@example.com' : 'name@example.com'}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs md:text-sm text-white focus:border-blue-500 focus:outline-none transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-400" />
                <span>{isRtl ? 'رابط الصورة الشخصية (أو ارفع من الجهاز أعلاه):' : 'Avatar Image URL (or upload from device above):'}</span>
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs md:text-sm text-white focus:border-blue-500 focus:outline-none transition font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isRtl ? 'رفع صورة جديدة مباشرة من جهازه 📁' : 'Upload new avatar directly from device 📁'}</span>
              <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
            </label>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isRtl ? 'حفظ التغييرات' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Contact Administration & Live Support Box */}
      <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/30 via-slate-950 to-indigo-950/40 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span>{isRtl ? 'مراسلة الإدارة والدعم الفني المباشر:' : 'Direct Administration & Support Chat:'}</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {isRtl ? 'متصل بالدعم الفوري' : 'Live Support Online'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isRtl 
            ? 'أرسل استفسارك أو طلبك مباشرة إلى إدارة المنصة وسيقوم فريق الدعم أو الإدارة بالرد عليك فوراً في لوحة حسابك:' 
            : 'Send your inquiries or requests directly to platform administration. Our support team will reply directly to your dashboard:'}
        </p>

        {/* Messages Transcript */}
        <div className="max-h-[260px] overflow-y-auto space-y-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          {(() => {
            const ticket = storageService.getTicketByUserId(currentUser?.id);
            const messages = ticket?.messages || [];
            if (messages.length === 0) {
              return (
                <p className="text-xs text-slate-500 text-center py-6 italic">
                  {isRtl ? 'لا توجد رسائل سابقة مع الإدارة. ابدأ بإرسال رسالتك الآن!' : 'No previous messages with admin. Start the conversation!'}
                </p>
              );
            }
            return messages.map((m) => {
              const isUser = m.sender === 'user';
              const isAdmin = m.sender === 'admin';
              return (
                <div key={m.id} className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs space-y-1 ${
                    isUser 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : isAdmin 
                        ? 'bg-gradient-to-r from-indigo-950 to-slate-900 border border-amber-500/50 text-amber-200 rounded-bl-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] opacity-75 font-bold border-b border-white/10 pb-1">
                      <span>{m.senderName || (isUser ? currentUser.name : 'الإدارة')}</span>
                      <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words pt-1">{m.text}</p>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Send Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!supportMsgInput.trim()) return;
            storageService.addMessageToTicket(
              currentUser.id,
              currentUser.name,
              currentUser.phone,
              currentUser.email || '',
              { sender: 'user', text: supportMsgInput.trim() }
            );
            setSupportMsgInput('');
            alert(isRtl ? 'تم إرسال رسالتك للإدارة بنجاح!' : 'Message sent to admin!');
          }}
          className="flex gap-2 pt-1"
        >
          <input
            type="text"
            value={supportMsgInput}
            onChange={(e) => setSupportMsgInput(e.target.value)}
            placeholder={isRtl ? 'اكتب رسالتك للإدارة هنا...' : 'Type your message to administration...'}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isRtl ? 'إرسال للإدارة' : 'Send'}</span>
          </button>
        </form>
      </div>

      {/* Account Session & Danger Zone Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>{isRtl ? 'إدارة الجلسة وحذف الحساب:' : 'Session Management & Account Safety:'}</span>
        </h4>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              storageService.logoutUser();
              onLogout();
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-200 hover:border-slate-500 hover:text-white transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'تسجيل الخروج من الحساب' : 'Logout of Account'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isRtl ? 'حذف الحساب والمسودات المسجلة' : 'Delete Account & Saved Drafts'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {isRtl ? 'تأكيد حذف الحساب نهائياً' : 'Confirm Permanent Account Deletion'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isRtl ? 'إجراء غير قابل للتراجع' : 'Irreversible Action'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isRtl 
                ? 'سيتم مسح بيانات حسابك بالكامل، بالإضافة إلى جميع مسودات الذكاء الاصطناعي والتعديلات التي أنشأتها، وسيتم تسجيل خروجك فوراً.'
                : 'All account data, saved drafts, and AI customizations will be deleted permanently. You will be logged out immediately.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentUser?.id) {
                    storageService.deleteUserAccount(currentUser.id);
                  } else {
                    storageService.logoutUser();
                  }
                  setShowDeleteConfirm(false);
                  onLogout();
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition"
              >
                {isRtl ? 'نعم، احذف الحساب الآن' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

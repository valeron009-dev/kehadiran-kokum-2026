
import React, { useState, useEffect } from 'react';
import { fetchAllKokumData } from './services/googleSheetService';
import { SheetData, AttendanceRecord } from './types';
import LogoHeader from './components/LogoHeader.tsx';
import AttendanceForm from './components/AttendanceForm.tsx';
import HistoryView from './components/HistoryView.tsx';
import PDFTemplate from './components/PDFTemplate.tsx';
import { STORAGE_KEY } from './constants.tsx';
import { Loader2, LayoutGrid, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sheetData, setSheetData] = useState<SheetData>({ students: [], teachers: [] });
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | undefined>();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [currentPDFRecord, setCurrentPDFRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await fetchAllKokumData();
        setSheetData(data);
        
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setRecords(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Gagal memuatkan data:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const saveRecord = (record: AttendanceRecord) => {
    let newRecords;
    if (editingRecord) {
      newRecords = records.map(r => r.id === record.id ? record : r);
    } else {
      newRecords = [...records, record];
    }
    
    setRecords(newRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    setEditingRecord(undefined);
    setActiveTab('history');
  };

  const deleteRecord = (id: string) => {
    if (confirm("Adakah anda pasti mahu memadam rekod ini?")) {
      const newRecords = records.filter(r => r.id !== id);
      setRecords(newRecords);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    }
  };

  const startEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setActiveTab('new');
  };

  const generatePDF = async (record: AttendanceRecord) => {
    setGeneratingPDF(true);
    setCurrentPDFRecord(record);

    setTimeout(async () => {
      const element = document.getElementById(`pdf-report-${record.id}`);
      if (!element) return;

      try {
        const canvas = await (window as any).html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new (window as any).jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`LAPORAN_KOKUM_${record.unit.replace(/\s+/g, '_')}_${record.date}.pdf`);
      } catch (err) {
        console.error("Gagal menjana PDF:", err);
      } finally {
        setGeneratingPDF(false);
        setCurrentPDFRecord(null);
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">Sila Tunggu, Memuatkan Data KOKUM 2026...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <LogoHeader />

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-md mx-auto">
          <button 
            onClick={() => { setActiveTab('new'); setEditingRecord(undefined); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase transition-all ${activeTab === 'new' ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            {editingRecord ? 'Kemaskini' : 'Laporan Baru'}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase transition-all ${activeTab === 'history' ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Clock className="w-4 h-4" />
            Arkib Rekod
          </button>
        </div>

        {activeTab === 'new' ? (
          <AttendanceForm 
            sheetData={sheetData} 
            onSave={saveRecord} 
            editRecord={editingRecord}
          />
        ) : (
          <HistoryView 
            records={records} 
            onEdit={startEdit} 
            onDelete={deleteRecord}
            onGeneratePDF={generatePDF}
          />
        )}
      </main>

      <footer className="mt-12 text-center text-gray-400 text-[10px] uppercase tracking-widest">
        &copy; 2026 SK Petagas - Sistem Pengurusan Kehadiran Kokurikulum
      </footer>

      {generatingPDF && currentPDFRecord && (
        <div className="fixed -left-[10000px] top-0 opacity-0 pointer-events-none">
          <PDFTemplate 
            record={currentPDFRecord} 
            studentList={sheetData.students.filter(s => s.category === currentPDFRecord.category && s.unit === currentPDFRecord.unit)} 
          />
        </div>
      )}

      {generatingPDF && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="font-bold text-gray-800 uppercase text-sm">Menjana Laporan PDF...</p>
            <p className="text-gray-400 text-[10px] mt-1 uppercase">Sila tunggu sebentar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

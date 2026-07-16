'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import Footer from '@/layouts/Footer';

export default function TCharityRunPage() {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [formData, setFormData] = useState({
        namaLengkap: '',
        email: '',
        whatsapp: '',
        angkatan: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#0A1931] font-sans antialiased flex flex-col justify-between">

            {/* NAVBAR */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className='flex items-center space-x-3'>
                        <button
                            onClick={() => setCurrentStep(1)}
                            className='cursor-pointer text-2xl font-bold text-[#000D3A] tracking-tight'
                        >
                            TCharity Run 2026
                        </button>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-500">
                        <button
                            onClick={() => setCurrentStep(1)}
                            className={`cursor-pointer pb-1 border-b-2 transition-all ${currentStep === 1 ? 'border-[#000D3A] text-[#000D3A] font-semibold' : 'border-transparent hover:text-gray-800'}`}
                        >
                            Event Info
                        </button>
                        <button
                            onClick={() => setCurrentStep(2)}
                            className={`cursor-pointer pb-1 border-b-2 transition-all ${currentStep === 2 ? 'border-[#000D3A] text-[#000D3A] font-semibold' : 'border-transparent hover:text-gray-800'}`}
                        >
                            Registration
                        </button>
                    </nav>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">

                {/* STEP 1: EVENT INFO & ROUTE MAP */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Hero Banner Placeholder */}
                        <div className="relative h-[450px] w-full bg-gradient-to-br from-blue-700 via-indigo-800 to-[#000D3A] rounded-3xl overflow-hidden shadow-lg flex items-end p-8 md:p-12">
                            {/* Graphic Placeholder Motif */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <div className="relative z-10 text-white">
                                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">TCharity Run 2026</h1>
                                <p className="text-md text-gray-200 font-light">TCharity Run merupakan event lari yang diselenggarakan oleh HMTC ITS sebagai bentuk ajakan kepada mahasiswa aktif dan alumni Teknik Informatika ITS untuk menerapkan gaya hidup sehat sekaligus berkontribusi dalam kegiatan sosial. Pendapatan yang diperoleh dari acara ini akan didonasikan kepada pihak yang membutuhkan. TCharity Run akan diselenggarakan pada 12 September 2026, dengan rangkaian acara yang meliputi main event berupa kegiatan lari, serta pasca-event yang diisi dengan sesi Q&amp;A, photo booth, dan pembagian doorprize.</p>
                            </div>
                        </div>

                        {/* Details & Facilities Section */}
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8">
                            {/* Detail Pelaksanaan */}
                            <div>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-blue-50 text-[#000D3A] rounded-xl">
                                        <Image
                                        src='/images/student-social-development/tcharity-run/calendar-icon.svg'
                                        alt='Calendar Icon'
                                        width={24}
                                        height={24}
                                        className='w-4 h-4'
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#000D3A]">Detail Pelaksanaan</h3>
                                </div>
                                <div className="space-y-4 border-l-2 border-gray-100 pl-4 ml-5">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Hari / Tanggal</span>
                                        <span className="text-base font-semibold text-gray-800">Sabtu, 12 September 2026</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Lokasi</span>
                                        <span className="text-base font-semibold text-gray-800">ITS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fasilitas Peserta */}
                            <div>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-blue-50 text-[#000D3A] rounded-xl">
                                        <Image
                                        src='/images/student-social-development/tcharity-run/facility-icon.svg'
                                        alt='Calendar Icon'
                                        width={24}
                                        height={24}
                                        className='w-4 h-4'
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#000D3A]">Fasilitas Peserta</h3>
                                </div>
                                <ul className="space-y-3 ml-5 pl-1">
                                    <li className="flex items-center space-x-3 text-sm font-medium text-gray-700">
                                        <span className="text-indigo-600">🏅</span> <span>Finisher Medal</span>
                                    </li>
                                    <li className="flex items-center space-x-3 text-sm font-medium text-gray-700">
                                        <span className="text-indigo-600">🔢</span> <span>Nomor Dada (BIB)</span>
                                    </li>
                                    <li className="flex items-center space-x-3 text-sm font-medium text-gray-700">
                                        <span className="text-indigo-600">💧</span> <span>Water Station & Refreshment</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Price & CTA Action Bar */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Harga Pendaftaran</span>
                                <span className="text-3xl font-extrabold text-[#000D3A]">Rp20.000</span>
                            </div>
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="cursor-pointer w-full sm:w-auto bg-[#000D3A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#100D3A]/80 transition shadow-lg shadow-blue-900/10 text-center"
                            >
                                Pesan Sekarang
                            </button>
                        </div>

                        {/* Route Map Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-50 text-[#000D3A] rounded-xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-[#000D3A]">Rute Lari</h3>
                            </div>

                            {/* Route Map Image Placeholder */}
                            <a href='https://earth.google.com/earth/d/1YT9YBZXCclaXY_h_5sAjz05LTSmZbjh4' className="cursor-pointer group relative mx-auto w-full md:max-w-[50%] p-2 bg-gray-100 border-4 border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:border-blue-200">
                                <Image
                                src='/images/student-social-development/tcharity-run/rute lari.png'
                                alt='Rute lari'
                                width={256}
                                height={459}
                                priority
                                draggable='false'
                                className='select-none rounded-2xl object-contain w-full h-auto border-4 border-gray-200'
                                />
                            </a>
                        </div>
                    </div>
                )}

                {/* STEP 2: REGISTRATION FORM */}
                {currentStep === 2 && (
                    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 space-y-8 animate-fadeIn">
                        <div>
                            <h2 className="text-3xl font-extrabold text-[#000D3A] tracking-tight mb-2">Data Peserta</h2>
                            <p className="text-sm text-gray-500">Silakan isi data diri dengan benar untuk keperluan pendataan peserta.</p>
                        </div>

                        <hr className="border-gray-100" />

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="namaLengkap"
                                    placeholder="Masukkan nama lengkap"
                                    value={formData.namaLengkap}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-200 focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Alamat Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="example@gmail.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-200 focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nomor Whatsapp</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    placeholder="0812xxxxxx"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-200 focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Angkatan</label>
                                <input
                                    type="text"
                                    name="angkatan"
                                    placeholder="contoh: 2024 / Alumni"
                                    value={formData.angkatan}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-gray-200 focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="cursor-pointer w-1/3 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition text-center text-sm"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="cursor-pointer w-2/3 bg-[#000D3A] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#100D3A]/80 transition shadow-md text-center text-sm"
                            >
                                Lanjut ke Pembayaran
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PAYMENT & QRIS */}
                {currentStep === 3 && (
                    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn flex flex-col">
                        {/* Header Ringkasan Pembayaran */}
                        <div className="bg-[#000D3A] text-white p-8 space-y-4">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-wider block">Ringkasan Pembayaran</span>
                            <div className="text-4xl font-black">Rp20.000</div>
                            <div className="flex justify-between text-sm text-white/80 pt-2 border-t border-white/10">
                                <span>Pendaftaran TCharity Run 2026</span>
                                <span className="font-bold">Rp20.000</span>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* QRIS Scan Placeholder */}
                            <div className="space-y-4 text-center">
                                <h3 className="text-lg font-bold text-[#000D3A]">Scan QRIS Untuk Melakukan Pembayaran</h3>
                                <div className="group relative mx-auto w-full md:max-w-[50%] p-2 bg-gray-100 border-4 border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all">
                                    <Image
                                    src='/images/student-social-development/tcharity-run/QRIS TCharity Run 2026.jpg'
                                    alt='Rute lari'
                                    width={256}
                                    height={459}
                                    priority
                                    draggable='false'
                                    className='select-none rounded-2xl object-contain w-full h-auto border-4 border-gray-200'
                                    />
                                </div>
                            </div>

                            {/* Upload Bukti */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-[#000D3A]">Bukti Pembayaran</h4>
                                <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 transition bg-[#F8F9FA] rounded-2xl p-8 text-center cursor-pointer group">
                                    <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition mb-3">
                                        <Image
                                        src='/images/student-social-development/tcharity-run/upload-icon.svg'
                                        alt='Calendar Icon'
                                        width={24}
                                        height={24}
                                        className='w-4 h-4'
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">Upload Bukti Pembayaran (JPG/PNG)</p>
                                    <p className="text-xs text-gray-400 mt-1">Maksimal ukuran file 2MB</p>
                                </div>
                            </div>

                            {/* Alert Warning Box */}
                            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3 text-blue-800 text-xs leading-relaxed">
                                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p>Pastikan mengunggah bukti yang valid untuk mempercepat proses verifikasi oleh panitia.</p>
                            </div>

                            {/* Action Button */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="cursor-pointer w-1/3 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition text-center text-sm"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={() => setCurrentStep(4)}
                                    className="cursor-pointer w-full bg-[#000D3A] text-white py-4 rounded-2xl font-bold hover:bg-[#100D3A]/80 transition shadow-md text-center text-sm"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: SUCCESS PAGE & QR TICKET */}
                {currentStep === 4 && (
                    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center space-y-8 animate-fadeIn">
                        {/* Green Success Badge */}
                        <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-sm">
                            ✓
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-extrabold text-[#000D3A] tracking-tight">Pendaftaran Berhasil!</h2>
                            <p className="text-sm text-gray-500 px-4">
                                Terima kasih telah mendaftar di TCharity Run 2026. Jangan lupa untuk join Group WhatsApp di bawah ini yaa.
                            </p>
                        </div>

                        {/* Ticket Graphic Placeholder */}
                        <div className="relative mx-auto w-72 bg-[#000D3A] text-white rounded-2xl p-6 shadow-xl overflow-hidden text-left">
                            {/* Ticket Side Cuts */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full"></div>
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full"></div>

                            <div className="flex justify-between items-start text-[10px] font-bold tracking-wider text-white/50 uppercase mb-6">
                                <div>
                                    <span className="block text-white/40">Event</span>
                                    <span className="text-white text-xs font-bold">TCharity Run 2026</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-white/40">Category</span>
                                    <span className="text-white text-xs font-bold">5K</span>
                                </div>
                            </div>

                            {/* Ticket QR Code Body */}
                            <div className="aspect-square w-full h-full mx-auto bg-white rounded-xl p-4 flex justify-center items-center shadow-inner relative">
                                <Image
                                src='/images/student-social-development/tcharity-run/QR Group WhatsApp Peserta TCharity Run.png'
                                alt='Rute lari'
                                fill
                                priority
                                draggable='false'
                                className='select-none'
                                />
                            </div>
                        </div>
                        <div>
                            <a href='https://chat.whatsapp.com/BGRa5UMxTP00H9njeSYJ3i' className='text-sm font-bold text-[#0000FF] hover:underline'>
                                https://chat.whatsapp.com/BGRa5UMxTP00H9njeSYJ3i
                            </a>
                        </div>

                        <button
                            onClick={() => {
                                setFormData({ namaLengkap: '', email: '', whatsapp: '', angkatan: '' });
                                setCurrentStep(1);
                            }}
                            className="cursor-pointer inline-block text-sm font-bold text-[#000D3A] hover:underline pt-4"
                        >
                            ← Kembali Ke Beranda Acara
                        </button>
                    </div>
                )}

            </main>

            {/* FOOTER */}
            <Footer />

            {/* Tailwind Animation Helper Inline Style */}
            <style jsx global>{`
                @keyframes fadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}

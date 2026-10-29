import React, { useRef } from 'react';
import Modal from './Modal';
import QRCode from 'qrcode';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const QRModal = ({ isOpen, onClose, qrCode, qrData, logoUrl, brandName }) => {
  const qrRef = useRef(null);
  const activeQr = qrCode || qrData;

  if (!activeQr) return null;

  const clientUrl = window.location.origin;
  const targetUrl = `${clientUrl}/q/${activeQr.token}`;

  const generatePrintLayoutDataURL = () => {
    return new Promise((resolve) => {
      const qrCanvas = qrRef.current?.querySelector('canvas');
      if (!qrCanvas) return resolve(null);
      const dataUrl = qrCanvas.toDataURL('image/png');

      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer elegant border (slate-900)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(15, 15, 370, 570, 16);
      } else {
        ctx.rect(15, 15, 370, 570);
      }
      ctx.stroke();

      // Inner subtle border (slate-200)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(22, 22, 356, 556, 10);
      } else {
        ctx.rect(22, 22, 356, 556);
      }
      ctx.stroke();

      // Welcome Text
      ctx.fillStyle = '#64748b';
      ctx.font = '600 12px sans-serif';
      ctx.textAlign = 'center';
      if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = '2px';
      }
      ctx.fillText('WELCOME TO', 200, 85);

      // Restaurant Name
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 24px sans-serif';
      if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = '0px';
      }
      ctx.fillText(activeQr.restaurant?.name || brandName || activeQr.branch?.name || 'Restaurant', 200, 120);

      // QR Image
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        ctx.drawImage(img, 70, 150, 260, 260);

        // Divider Line
        ctx.beginPath();
        ctx.moveTo(150, 450);
        ctx.lineTo(250, 450);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Scan Instruction
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px sans-serif';
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = '1px';
        }
        ctx.fillText('SCAN FOR DIGITAL MENU', 200, 495);

        // Table Name (Elegant Italic)
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 16px sans-serif';
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = '0px';
        }
        const tableNameText = activeQr.tableName ? `Table: ${activeQr.tableName}` : '';
        if (tableNameText) {
          ctx.fillText(tableNameText, 200, 530);
        }

        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => resolve(dataUrl);
    });
  };

  const downloadPNG = async () => {
    try {
      const dataUrl = await generatePrintLayoutDataURL();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR_${activeQr.token}_${activeQr.tableName || 'menu'}.png`;
      link.click();
      toast.success('Print-ready QR card downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code.');
    }
  };

  const downloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        width: 600,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${activeQr.token}_${activeQr.tableName || 'menu'}.svg`;
      link.click();
      toast.success('SVG QR code downloaded!');
    } catch (err) {
      toast.error('Failed to download SVG.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const qrCanvas = qrRef.current?.querySelector('canvas');
    const dataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : '';
    const tableNameText = activeQr.tableName ? `Table: ${activeQr.tableName}` : '';
    const restName = activeQr.restaurant?.name || brandName || activeQr.branch?.name || 'Restaurant';

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${activeQr.tableName || 'Menu Table'}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; text-align: center; }
            .card { border: 2px solid #0f172a; padding: 6px; border-radius: 16px; width: 370px; height: 570px; box-sizing: border-box; }
            .inner-border { border: 1px solid #e2e8f0; border-radius: 10px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
            .welcome { font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 2px; margin: 0 0 5px 0; }
            h2 { font-size: 24px; color: #0f172a; font-weight: 900; margin: 0 0 30px 0; }
            img { width: 260px; height: 260px; margin-bottom: 20px; }
            hr { width: 100px; border: 0; border-top: 1px solid #cbd5e1; margin: 10px 0 20px 0; }
            h3 { font-size: 18px; color: #0f172a; font-weight: bold; margin: 0 0 10px 0; letter-spacing: 1px; }
            .table-name { font-size: 16px; color: #64748b; font-style: italic; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="inner-border">
              <p class="welcome">WELCOME TO</p>
              <h2>${restName}</h2>
              <img src="${dataUrl}" />
              <hr />
              <h3>SCAN FOR DIGITAL MENU</h3>
              ${tableNameText ? `<p class="table-name">${tableNameText}</p>` : ''}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Details & Branded Export">
      <div className="flex flex-col items-center space-y-6">
        {/* QR Code Canvas with Embedded Logo */}
        <div ref={qrRef} className="p-5 bg-white rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center">
          <QRCodeCanvas url={targetUrl} logoUrl={logoUrl || activeQr.branch?.logo} brandName={brandName || activeQr.branch?.name} />
        </div>

        {/* QR Meta */}
        <div className="text-center space-y-1">
          <h4 className="font-bold text-lg text-slate-900 dark:text-white">
            {activeQr.tableName || 'General QR Code'}
          </h4>
          <p className="text-sm text-slate-500">
            Menu: <span className="font-semibold text-amber-600 dark:text-amber-400">{activeQr.menu?.name}</span>
          </p>
          <p className="text-xs text-slate-400 break-all bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
            {targetUrl}
          </p>
        </div>

        {/* Export Action Buttons */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <button
            onClick={downloadPNG}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-amber-500" />
            PNG
          </button>
          <button
            onClick={downloadSVG}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-indigo-500" />
            SVG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition shadow-sm"
          >
            <PrinterIcon className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Internal canvas renderer with centered logo/text badge and Error Correction Level H
const QRCodeCanvas = ({ url, logoUrl, brandName }) => {
  const canvasRef = useRef(null);

  React.useEffect(() => {
    let isMounted = true;

    const renderQR = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 1. Draw base QR code matrix with High Error Correction Level 'H'
      await QRCode.toCanvas(canvas, url, {
        width: 250,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      if (!isMounted) return;

      const ctx = canvas.getContext('2d');
      const center = canvas.width / 2;
      const logoSize = Math.floor(canvas.width * 0.22); // 22% of QR width (~55px)
      const radius = logoSize / 2;

      // 2. Clear circular area in center with solid white border shield
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      if (logoUrl) {
        // 3. Draw circular image logo inside shield
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;
        img.onload = () => {
          if (!isMounted) return;
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, center - radius, center - radius, logoSize, logoSize);
          ctx.restore();
        };
        img.onerror = () => {
          // Fallback to text initial badge if image fails to load
          drawTextBadge(ctx, center, radius, brandName);
        };
      } else {
        // 4. Draw brand initial text badge
        drawTextBadge(ctx, center, radius, brandName);
      }
      ctx.restore();
    };

    const drawTextBadge = (ctx, center, radius, name) => {
      const initial = (name || 'R').charAt(0).toUpperCase();
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; // Amber brand color
      ctx.fill();

      ctx.font = '900 22px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, center, center + 1);
      ctx.restore();
    };

    renderQR();

    return () => {
      isMounted = false;
    };
  }, [url, logoUrl, brandName]);

  return <canvas ref={canvasRef} className="rounded-xl shadow-sm" />;
};

export default QRModal;

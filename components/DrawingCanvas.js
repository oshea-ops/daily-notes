'use client';

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Trash2, Check } from 'lucide-react';
import styles from './DrawingCanvas.module.css';

export default function DrawingCanvas({ onSave, onClose }) {
  const sigCanvas = useRef({});

  const handleClear = () => {
    sigCanvas.current.clear();
  };

  const handleSave = () => {
    if (sigCanvas.current.isEmpty()) {
      onClose();
      return;
    }
    const dataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Sketch Note</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.canvasContainer}>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              className: 'sigCanvas',
              style: { width: '100%', height: '100%' }
            }}
          />
        </div>

        <div className={styles.actions}>
          <div className={styles.tools}>
            <button className={styles.clearButton} onClick={handleClear}>
              <Trash2 size={16} />
              Clear
            </button>
          </div>
          <button className={styles.saveButton} onClick={handleSave}>
            <Check size={16} />
            Attach Sketch
          </button>
        </div>
      </div>
    </div>
  );
}

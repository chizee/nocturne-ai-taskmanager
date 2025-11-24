/**
 * CSVImportUI - File upload interface for importing tasks
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui';
import { CSVImporter } from '@/lib/csv-importer';
import { Task } from '@/lib/types';

export interface CSVImportUIProps {
  onImport: (tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onClose: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const CSVImportUI: React.FC<CSVImportUIProps> = ({ onImport, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importer = useRef(new CSVImporter());

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const result = await importer.current.parseFile(file);
      const tasks = importer.current.convertToTasks(result.validRows);
      
      onImport(tasks);
      
      setResult({
        success: tasks.length,
        failed: 0,
        errors: [],
      });
    } catch (error) {
      setResult({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      {!result && (
        <motion.div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10'
              : 'border-[var(--color-muted)] hover:border-[var(--color-primary)]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          
          {!file ? (
            <>
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-heading text-[var(--color-fg)] mb-2">
                Drop CSV file here
              </h3>
              <p className="text-[var(--color-muted)] mb-4">
                or click to browse
              </p>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-heading text-[var(--color-fg)] mb-2">
                {file.name}
              </h3>
              <p className="text-[var(--color-muted)] mb-4">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Importing...' : '📥 Import Tasks'}
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                  🔄 Choose Different File
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Import Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-xl p-6"
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-4">
                {result.success > 0 ? '🎉' : '❌'}
              </div>
              <h3 className="text-2xl font-heading text-[var(--color-fg)] mb-2">
                Import {result.success > 0 ? 'Successful' : 'Failed'}
              </h3>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[var(--color-fg)]">
                <span>✅ Successfully imported:</span>
                <span className="font-bold">{result.success} tasks</span>
              </div>
              {result.failed > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>❌ Failed:</span>
                  <span className="font-bold">{result.failed} tasks</span>
                </div>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-6">
                <h4 className="text-red-400 font-semibold mb-2">Errors:</h4>
                <ul className="text-sm text-red-300 space-y-1">
                  {result.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button variant="primary" onClick={onClose}>
                ✨ Done
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                📁 Import Another File
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV Format Example */}
      {!file && !result && (
        <div className="glass rounded-xl p-6">
          <h4 className="text-lg font-heading text-[var(--color-fg)] mb-3">
            📋 CSV Format Example
          </h4>
          <div className="bg-[var(--color-bg)] rounded-lg p-4 font-mono text-sm text-[var(--color-muted)] overflow-x-auto">
            <pre>
{`description,dueDate,tags,completed
"Buy groceries","2025-11-25","shopping,urgent",false
"Finish report","2025-11-23","work",false
"Call mom","","personal",false`}
            </pre>
          </div>
          <p className="text-sm text-[var(--color-muted)] mt-3">
            💡 <strong>Tip:</strong> The first row should contain column headers.
            Dates should be in YYYY-MM-DD format. Tags should be comma-separated.
          </p>
        </div>
      )}
    </div>
  );
};

CSVImportUI.displayName = 'CSVImportUI';

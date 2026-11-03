'use client';

import React from 'react';
import { ToastContainer, Bounce, type IconProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function renderToastIcon({ type }: IconProps) {
  switch (type) {
    case 'success':
      return (
        <div className="w-6 h-6 rounded-full border border-status-success bg-status-success text-white flex items-center justify-center shrink-0">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    case 'error':
      return (
        <div className="w-6 h-6 rounded-full border border-status-error bg-status-error text-white flex items-center justify-center shrink-0">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      );
    case 'warning':
      return (
        <div className="w-6 h-6 rounded-full border border-status-warning bg-status-warning text-white flex items-center justify-center shrink-0">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 9v4m0 4h.01"
            />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-full border border-status-info bg-status-info text-white flex items-center justify-center shrink-0">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 16h-1v-4h-1m1-4h.01"
            />
          </svg>
        </div>
      );
  }
}

export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
      icon={renderToastIcon}
      toastClassName="clownfish-toast"
      progressClassName="clownfish-toast-progress"
    />
  );
}

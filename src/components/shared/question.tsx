"use client";
import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuestionItemProps {
  question: string;
  answer: string;
}

const QuestionItem = ({ question, answer }: QuestionItemProps) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-secondary rounded-lg shadow-md p-4 transition cursor-pointer font-headline w-full">
      {/* encabezado */}
      <div
        className="flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-base font-semibold">{question}</h3>
        {open ? (
          <ChevronUp className="w-5 h-5 text-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* respuesta con animación */}
      <div
        ref={contentRef}
        className={`transition-all duration-500 ease-in-out overflow-hidden`}
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <p className="mt-3 text-sm text-gray-300 whitespace-pre-line">{answer}</p>
      </div>
    </div>
  );
};

export default QuestionItem;

import React from "react";
import { Container } from "@/components/Container";

export function Footer() {
  return (
    <div className="relative">
      <div className="border-t border-gray-200 dark:border-gray-700"></div>
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* O projekcie */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                O projekcie
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Wroniak to platforma stworzona specjalnie dla studentów, którzy szukają pracy we Wrocławiu. 
                Pomagamy znaleźć staże, pracę dorywczą i pierwsze doświadczenie zawodowe.
              </p>
            </div>

            {/* Kontakt */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Kontakt
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>📧 info@wroniak.pl</p>
                <p>🌐 Wrocław, Polska</p>
                <p>💼 Dla pracodawców</p>
              </div>
            </div>

            {/* Przydatne linki */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Przydatne linki
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Jak znaleźć pracę</a></p>
                <p><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Wskazówki dla studentów</a></p>
                <p><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a></p>
              </div>
            </div>
          </div>

          {/* Linia podziału */}
          <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

          {/* Copyright i dodatkowe informacje */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              © 2025 Wroniak. Wszystkie prawa zastrzeżone.
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Stworzone z ❤️ dla studentów Wrocławia
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

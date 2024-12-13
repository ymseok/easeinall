"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { SeasonPrice } from "../types/index";

interface SeasonPriceFormProps {
  seasonPrices: SeasonPrice[];
  onSubmit: (prices: SeasonPrice[]) => void;
  onValidationError?: (message: string) => void;
}

export interface SeasonPriceFormRef {
  validateAndFocus: () => boolean;
}

const SeasonPriceForm = forwardRef<SeasonPriceFormRef, SeasonPriceFormProps>(
  (props, ref) => {
    const { seasonPrices, onSubmit, onValidationError } = props;
    const [prices, setPrices] = useState<SeasonPrice[]>(seasonPrices);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      setPrices(seasonPrices);
      inputRefs.current = inputRefs.current.slice(0, seasonPrices.length);
    }, [seasonPrices]);

    useImperativeHandle(ref, () => ({
      validateAndFocus: () => {
        const emptyPriceIndex = prices.findIndex((sp) => !sp.price);
        if (emptyPriceIndex !== -1) {
          inputRefs.current[emptyPriceIndex]?.focus();
          onValidationError?.(
            `시즌 ${prices[emptyPriceIndex].season}의 MBX 시세를 입력해주세요.`
          );
          return false;
        }
        return true;
      },
    }));

    const handlePriceChange = (season: number, price: number) => {
      const newPrices = prices.map((sp) =>
        sp.season === season ? { ...sp, price } : sp
      );
      setPrices(newPrices);
      onSubmit(newPrices);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prices.map(({ season, price }, index) => (
          <div
            key={season}
            className="p-4 border rounded-lg bg-white space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">
              시즌 {season} MBX 시세
            </label>
            <div className="flex items-center space-x-2">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="number"
                value={price || ""}
                onChange={(e) =>
                  handlePriceChange(season, parseFloat(e.target.value))
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="시세 입력"
                min="0"
                step="0.01"
              />
              <span className="text-gray-500">MBX</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

SeasonPriceForm.displayName = "SeasonPriceForm";

export default SeasonPriceForm;

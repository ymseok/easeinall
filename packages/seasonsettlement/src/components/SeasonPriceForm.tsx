"use client";

import {
  forwardRef,
  ForwardRefRenderFunction,
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

const SeasonPriceFormComponent: ForwardRefRenderFunction<
  SeasonPriceFormRef,
  SeasonPriceFormProps
> = ({ seasonPrices, onSubmit, onValidationError }, ref) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [prices, setPrices] = useState<SeasonPrice[]>(seasonPrices);

  useEffect(() => {
    setPrices(seasonPrices);
    inputRefs.current = inputRefs.current.slice(0, seasonPrices.length);
  }, [seasonPrices]);

  useImperativeHandle(ref, () => ({
    validateAndFocus: () => {
      // Point 시세 체크
      const emptyPointIndex = prices.findIndex((sp) => !sp.pointPrice);
      if (emptyPointIndex !== -1) {
        inputRefs.current[emptyPointIndex * 2]?.focus();
        onValidationError?.(
          `시즌 ${prices[emptyPointIndex].season}의 Point 시세를 입력해주세요.`
        );
        return false;
      }

      // MBX 시세 체크
      const emptyMbxIndex = prices.findIndex((sp) => !sp.mbxPrice);
      if (emptyMbxIndex !== -1) {
        inputRefs.current[emptyMbxIndex * 2 + 1]?.focus();
        onValidationError?.(
          `시즌 ${prices[emptyMbxIndex].season}의 MBX 시세를 입력해주세요.`
        );
        return false;
      }

      return true;
    },
  }));

  const handlePriceChange = (
    season: number,
    priceType: "mbxPrice" | "pointPrice",
    value: string
  ) => {
    const newPrices = prices.map((sp) =>
      sp.season === season
        ? { ...sp, [priceType]: value === "" ? "" : value || 0 }
        : sp
    );
    setPrices(newPrices);
    onSubmit(newPrices);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {prices.map((sp, index) => (
        <div
          key={sp.season}
          className="p-6 border rounded-lg bg-white shadow-sm"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            시즌 {sp.season}
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Point 시세
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <input
                  ref={(el) => {
                    inputRefs.current[index * 2] = el;
                  }}
                  type="number"
                  value={sp.pointPrice || ""}
                  onChange={(e) =>
                    handlePriceChange(sp.season, "pointPrice", e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Point 시세 입력"
                  min="0"
                  step="0.000001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                MBX 시세
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <input
                  ref={(el) => {
                    inputRefs.current[index * 2 + 1] = el;
                  }}
                  type="number"
                  value={sp.mbxPrice || ""}
                  onChange={(e) =>
                    handlePriceChange(sp.season, "mbxPrice", e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="MBX 시세 입력"
                  min="0"
                  step="0.000001"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SeasonPriceForm = forwardRef(SeasonPriceFormComponent);
SeasonPriceForm.displayName = "SeasonPriceForm";

export default SeasonPriceForm;

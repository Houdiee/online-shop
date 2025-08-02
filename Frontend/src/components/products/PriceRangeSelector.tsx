import { useEffect, useState } from "react";
import { Flex, InputNumber, Slider, Typography } from "antd";

interface PriceRangeSelectorProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  minRange?: number;
  maxRange?: number;
}

export default function PriceRangeSelector({
  min,
  max,
  onChange,
  minRange = 0,
  maxRange = 1000,
}: PriceRangeSelectorProps) {

  const [currentRange, setCurrentRange] = useState<[number, number]>([min, max]);

  const step = Math.ceil(maxRange / 100);

  useEffect(() => {
    setCurrentRange([min, max]);
  }, [min, max]);

  const handleSliderChange = (value: number[]) => {
    setCurrentRange(value as [number, number]);
    onChange(value[0], value[1]);
  };

  const handleMinInputChange = (value: number | null) => {
    const newMin = value === null ? minRange : value;
    const newRange: [number, number] = [newMin, currentRange[1]];
    setCurrentRange(newRange);
    onChange(newRange[0], newRange[1]);
  };

  const handleMaxInputChange = (value: number | null) => {
    const newMax = value === null ? maxRange : value;
    const newRange: [number, number] = [currentRange[0], newMax];
    setCurrentRange(newRange);
    onChange(newRange[0], newRange[1]);
  };

  return (
    <>
      <div className="p-1">
        <Slider
          range
          min={minRange}
          max={maxRange}
          step={step}
          value={currentRange}
          onChange={handleSliderChange}
        />
        <Flex justify="center" align="center" className="gap-2">
          <InputNumber
            min={minRange}
            max={currentRange[1]}
            value={currentRange[0]}
            onChange={handleMinInputChange}
            className="w-24 rounded-md"
            formatter={value => `$ ${value}`}
            parser={value => value!.replace('$ ', '') as any}
          />
          <Typography.Text className="text-gray-600">-</Typography.Text>
          <InputNumber
            min={currentRange[0]}
            max={maxRange}
            value={currentRange[1]}
            onChange={handleMaxInputChange}
            className="w-24 rounded-md"
            formatter={value => `$ ${value}`}
            parser={value => value!.replace('$ ', '') as any}
          />
        </Flex>
      </div>
    </>
  );
}


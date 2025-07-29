import { useEffect, useState } from "react";
import { Flex, InputNumber, Slider, Typography } from "antd";

interface PriceRangeSelectorProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  initialMinRange?: number;
  initialMaxRange?: number;
}

export default function PriceRangeSelector({
  min,
  max,
  onChange,
  initialMinRange = 0,
  initialMaxRange = 1000,
}: PriceRangeSelectorProps) {

  const [currentRange, setCurrentRange] = useState<[number, number]>([min, max]);

  useEffect(() => {
    setCurrentRange([min, max]);
  }, [min, max]);

  const handleSliderChange = (value: number[]) => {
    setCurrentRange(value as [number, number]);
    onChange(value[0], value[1]);
  };

  const handleMinInputChange = (value: number | null) => {
    const newMin = value === null ? initialMinRange : value;
    const newRange: [number, number] = [newMin, currentRange[1]];
    setCurrentRange(newRange);
    onChange(newRange[0], newRange[1]);
  };

  const handleMaxInputChange = (value: number | null) => {
    const newMax = value === null ? initialMaxRange : value;
    const newRange: [number, number] = [currentRange[0], newMax];
    setCurrentRange(newRange);
    onChange(newRange[0], newRange[1]);
  };

  return (
    <>
      <div className="p-1">
        <Slider
          range
          min={initialMinRange}
          max={initialMaxRange}
          step={10}
          value={currentRange}
          onChange={handleSliderChange}
        />
        <Flex justify="between" align="center" className="gap-2">
          <InputNumber
            min={initialMinRange}
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
            max={initialMaxRange}
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


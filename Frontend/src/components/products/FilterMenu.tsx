import { useState } from 'react';
import { Menu, type MenuProps } from "antd";
import PriceRangeSelector from './PriceRangeSelector';
import { tags } from '../../mock/tags';

type MenuItem = Required<MenuProps>['items'][number];

export default function FilterMenu() {
  const [selectedFilterKey, setSelectedFilterKey] = useState<string>("sort-group-1");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const handleMenuClick = (e: any) => {
    if (e.key != "price-range-selector-item") {
      setSelectedFilterKey(e.key);
      console.log('Selected filter:', e.key);
    };
  }

  const handlePriceRangeChange = (newMin: number, newMax: number) => {
    setMinPrice(newMin);
    setMaxPrice(newMax);
    console.log('Price range changed:', newMin, newMax);
  };

  const filterItems: MenuItem[] = [
    {
      key: "sort-group",
      label: "Sort By",
      children: [
        {
          key: "sort-group-1",
          label: "Price: Low to High",
        },
        {
          key: "sort-group-2",
          label: "Price: High to Low",
        },
        {
          key: "sort-group-3",
          label: "Newest",
        },
      ]
    },
    {
      key: "category-group",
      label: "Category",
      children: tags.map((tag, index) => (
        {
          key: `category-group-${index}`,
          label: tag,
        }
      )),
    },
    {
      key: "price-group",
      label: "Price",
      children: [
        {
          key: "price-range-selector-item",
          label: (
            <PriceRangeSelector
              min={minPrice}
              max={maxPrice}
              onChange={handlePriceRangeChange}
              initialMinRange={0}
              initialMaxRange={1000}
            />
          ),
          style: { width: '280px', overflow: 'visible', height: 'auto' }, // Increased width and allowed overflow
        }
      ]
    }
  ];

  return (
    <Menu
      mode="inline"
      items={filterItems}
      className="w-full bg-white rounded-lg font-inter"
      selectedKeys={[selectedFilterKey]}
      onClick={handleMenuClick}
      defaultOpenKeys={["sort-group", "price-group"]}
    />
  );
}


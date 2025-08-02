import { Menu, type MenuProps } from "antd";
import PriceRangeSelector from './PriceRangeSelector';
import { tags } from '../../mock/tags';

type MenuItem = Required<MenuProps>['items'][number];

interface FilterMenuProps {
  className: string;
  selectedSortKey: string;
  onSortChange: (key: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (range: { min: number, max: number }) => void;
};

export default function FilterMenu({
  className,
  selectedSortKey,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceChange
}: FilterMenuProps) {

  const handleMenuClick = (e: any) => {
    if (e.key !== "price-range-selector-item") {
      onSortChange(e.key);
    }
  }

  const handlePriceRangeChange = (newMin: number, newMax: number) => {
    onPriceChange({ min: newMin, max: newMax });
  };

  const filterItems: MenuItem[] = [
    {
      key: "sort-group",
      label: "Sort By",
      children: [
        {
          key: "sort-group-relevant",
          label: "Relevant",
        },
        {
          key: "sort-group-low-to-high",
          label: "Price: Low to High",
        },
        {
          key: "sort-group-high-to-low",
          label: "Price: High to Low",
        },
        {
          key: "sort-group-newest",
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
          style: { height: "auto" },
        }
      ]
    }
  ];

  return (
    <Menu
      mode="inline"
      items={filterItems}
      selectedKeys={[selectedSortKey]}
      onClick={handleMenuClick}
      defaultOpenKeys={["sort-group", "price-group"]}
      className={className}
    />
  );
}

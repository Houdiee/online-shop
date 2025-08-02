import { Menu, type MenuProps } from "antd";
import PriceRangeSelector from './PriceRangeSelector';

type MenuItem = Required<MenuProps>['items'][number];

interface FilterMenuProps {
  className: string;
  selectedSortKey: string;
  onSortChange: (key: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (range: { min: number; max: number; }) => void;
  tags: string[];
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  maxRange: number;
};

export default function FilterMenu({
  className,
  selectedSortKey,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceChange,
  tags,
  selectedTags,
  onTagChange,
  maxRange
}: FilterMenuProps) {

  const handleMenuClick = (e: any) => {
    if (e.key.startsWith("category-group-")) {
      const tag = e.key.replace("category-group-", "");
      const newSelectedTags = selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag];
      onTagChange(newSelectedTags);
    } else if (e.key !== "price-range-selector-item") {
      onSortChange(e.key);
    }
  }

  const handlePriceRangeChange = (newMin: number, newMax: number) => {
    onPriceChange({ min: newMin, max: newMax });
  };

  const allSelectedKeys = [selectedSortKey, ...selectedTags.map(tag => `category-group-${tag}`)];

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
      children: tags.map(tag => (
        {
          key: `category-group-${tag}`,
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
              minRange={0}
              maxRange={maxRange}
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
      selectedKeys={allSelectedKeys}
      onClick={handleMenuClick}
      defaultOpenKeys={["sort-group", "price-group"]}
      className={className}
    />
  );
}


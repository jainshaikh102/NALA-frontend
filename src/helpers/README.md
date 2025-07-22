# Number Formatting Helper Functions

This folder contains utility functions for formatting numbers throughout the NALA frontend application.

## Available Functions

### `addCommas(num)`
Adds commas to numbers for better readability.

```typescript
import { addCommas } from "@/helpers/numberUtils";

addCommas(1234567) // "1,234,567"
addCommas("9876543") // "9,876,543"
addCommas(1000) // "1,000"
```

### `formatLargeNumber(num, decimals?)`
Converts large numbers to abbreviated format (K, M, B, T).

```typescript
import { formatLargeNumber } from "@/helpers/numberUtils";

formatLargeNumber(1234) // "1.2K"
formatLargeNumber(1234567) // "1.2M"
formatLargeNumber(1234567890) // "1.2B"
formatLargeNumber(65165165496231) // "65.2T"
formatLargeNumber(1234567, 2) // "1.23M" (with 2 decimals)
```

### `formatNumberWithCommas(num, decimals?)`
Uses commas for smaller numbers, abbreviations for larger ones.

```typescript
import { formatNumberWithCommas } from "@/helpers/numberUtils";

formatNumberWithCommas(1234) // "1,234"
formatNumberWithCommas(1234567) // "1.2M"
formatNumberWithCommas(999999) // "999,999"
formatNumberWithCommas(1000000) // "1.0M"
```

### `formatCurrency(num, currency?, decimals?)`
Formats currency values with proper symbols.

```typescript
import { formatCurrency } from "@/helpers/numberUtils";

formatCurrency(1234567.89) // "$1.23M"
formatCurrency(1234.56) // "$1,234.56"
formatCurrency(1000000, "€") // "€1.00M"
formatCurrency(1234.567, "$", 1) // "$1,234.6"
```

### `formatPercentage(num, decimals?)`
Formats percentage values.

```typescript
import { formatPercentage } from "@/helpers/numberUtils";

formatPercentage(0.1234) // "12.3%"
formatPercentage(0.05) // "5.0%"
formatPercentage(1.5) // "150.0%"
```

### `formatFollowers(num, decimals?)`
Formats follower counts with "followers" suffix.

```typescript
import { formatFollowers } from "@/helpers/numberUtils";

formatFollowers(1234567) // "1.2M followers"
formatFollowers(5000) // "5.0K followers"
formatFollowers(999) // "999 followers"
```

### `formatListeners(num, decimals?)`
Formats listener counts with "listeners" suffix.

```typescript
import { formatListeners } from "@/helpers/numberUtils";

formatListeners(1234567) // "1.2M listeners"
formatListeners(5000) // "5.0K listeners"
formatListeners(999) // "999 listeners"
```

### `formatViews(num, decimals?)`
Formats view counts with "views" suffix.

```typescript
import { formatViews } from "@/helpers/numberUtils";

formatViews(1234567) // "1.2M views"
formatViews(5000) // "5.0K views"
formatViews(999) // "999 views"
```

## Usage Examples

### In React Components

```typescript
import { formatListeners, formatLargeNumber, addCommas } from "@/helpers/numberUtils";

const ArtistCard = ({ artist }) => {
  return (
    <div>
      <h3>{artist.name}</h3>
      <p>{formatListeners(artist.followers)}</p>
      <p>Streams: {formatLargeNumber(artist.streams)}</p>
      <p>Revenue: ${addCommas(artist.revenue)}</p>
    </div>
  );
};
```

### In Data Tables

```typescript
import { formatLargeNumber } from "@/helpers/numberUtils";

const DataTable = ({ data }) => {
  const formatNumber = (value) => {
    if (typeof value === "number") {
      return formatLargeNumber(value);
    }
    return value;
  };

  return (
    <table>
      {data.map(row => (
        <tr key={row.id}>
          <td>{row.name}</td>
          <td>{formatNumber(row.value)}</td>
        </tr>
      ))}
    </table>
  );
};
```

## Real-World Examples

```typescript
// Large numbers from APIs
formatLargeNumber(65165165496231) // "65.2T"
formatLargeNumber(102500650) // "102.5M"
formatLargeNumber(32500650) // "32.5M"
formatLargeNumber(5020650) // "5.0M"
formatLargeNumber(958462) // "958.5K"

// Currency formatting
formatCurrency(210938921.77) // "$210.94M"
formatCurrency(2379442.18) // "$2,379,442.18"

// Social media metrics
formatFollowers(27709850713) // "27.7B followers"
formatListeners(8555589489) // "8.6B listeners"
formatViews(6482884964) // "6.5B views"
```

## Notes

- All functions handle `null`, `undefined`, and invalid inputs gracefully
- Functions accept both numbers and strings as input
- Decimal places can be customized for most functions
- Functions are optimized for performance and readability
- All functions are fully typed with TypeScript

# Elbot Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)

A custom Lovelace card for Home Assistant that displays electricity pricing recommendations based on current price and solar production.

![Elbot Card Example](https://via.placeholder.com/600x200.png?text=Add+Screenshot+Here)

## Features

- 🎨 Beautiful gradient backgrounds that change based on status
- ⚡ Real-time electricity pricing display
- ☀️ Solar production awareness
- 📊 Shows cheapest upcoming price
- 🎯 Click to view detailed pricing information
- 🎭 Dynamic icons for each state

## Installation

### HACS (Recommended)

1. Make sure [HACS](https://hacs.xyz/) is installed
2. Go to HACS → Frontend
3. Click the three dots in the top right
4. Select "Custom repositories"
5. Add `https://github.com/YOUR_USERNAME/elbot-card` as a "Lovelace" repository
6. Click "Install"
7. Restart Home Assistant

### Manual Installation

1. Download `elbot-card.js` from the [latest release](https://github.com/YOUR_USERNAME/elbot-card/releases)
2. Copy to `/config/www/elbot-card/elbot-card.js`
3. Add to your Lovelace resources:

```yaml
resources:
  - url: /local/elbot-card/elbot-card.js
    type: module
```

4. Restart Home Assistant

## Configuration

### Required Entities

First, create the required template sensors in your Home Assistant configuration. Add this to your `configuration.yaml` or in a package file:

```yaml
input_number:
  elbot_price_threshold:
    name: "Electricity Price Threshold"
    min: 0.0
    max: 10.0
    step: 0.1
    unit_of_measurement: "DKK/kWh"
    mode: slider
    initial: 2.0

  elbot_solar_production_threshold_watts:
    name: "Solar Production Threshold (W)"
    min: 0
    max: 5000
    step: 100
    unit_of_measurement: "W"
    mode: slider
    initial: 1000

template:
  - sensor:
      - name: "Elbot Recommendation Status"
        unique_id: "elbot_recommendation_status"
        state: >
          {% set current_price = states('sensor.energi_data_service') | float(0) %}
          {% set solar_production = states('sensor.your_solar_sensor') | float(0) %}
          {% set price_threshold = states('input_number.elbot_price_threshold') | float(2.0) %}
          {% set solar_threshold = states('input_number.elbot_solar_production_threshold_watts') | float(1000) %}
          {% set price_difference = current_price - price_threshold %}
          
          {% if current_price < price_threshold and solar_production > solar_threshold %}
            Perfect
          {% elif current_price < (price_threshold - 0.5) %}
            Good
          {% elif price_difference | abs <= 0.5 %}
            Caution
          {% else %}
            Bad
          {% endif %}
        attributes:
          current_price: "{{ states('sensor.energi_data_service') | float(0) }}"
        icon: mdi:flash
          
      - name: "Cheapest Upcoming Prices"
        unique_id: "elbot_cheapest_prices"
        unit_of_measurement: "DKK/kWh"
        state: >
          {% set ns = namespace(prices=[]) %}
          {% set current_hour = now().hour %}
          {% set raw_today = state_attr('sensor.energi_data_service', 'raw_today') %}
          {% set raw_tomorrow = state_attr('sensor.energi_data_service', 'raw_tomorrow') %}
          
          {% if raw_today %}
            {% for entry in raw_today %}
              {% set entry_hour = entry.hour | as_datetime | as_local %}
              {% if entry_hour.hour >= current_hour and entry_hour.hour < current_hour + 3 %}
                {% set ns.prices = ns.prices + [entry.price] %}
              {% endif %}
            {% endfor %}
          {% endif %}
          
          {% if ns.prices | length > 0 %}
            {{ ns.prices | min | round(3) }}
          {% else %}
            {{ states('sensor.energi_data_service') | float(0) }}
          {% endif %}
        attributes:
          next_6h_price: >
            {% set ns = namespace(min_price=999) %}
            {% set current_hour = now().hour %}
            {% set raw_today = state_attr('sensor.energi_data_service', 'raw_today') %}
            {% set raw_tomorrow = state_attr('sensor.energi_data_service', 'raw_tomorrow') %}
            
            {% if raw_today %}
              {% for entry in raw_today %}
                {% set entry_hour = entry.hour | as_datetime | as_local %}
                {% if entry_hour.hour >= current_hour and entry_hour.hour < current_hour + 6 %}
                  {% if entry.price < ns.min_price %}
                    {% set ns.min_price = entry.price %}
                  {% endif %}
                {% endif %}
              {% endfor %}
            {% endif %}
            
            {{ ns.min_price | round(3) }}
          next_6h_time: >
            {% set ns = namespace(min_price=999, min_time='') %}
            {% set current_hour = now().hour %}
            {% set raw_today = state_attr('sensor.energi_data_service', 'raw_today') %}
            {% set raw_tomorrow = state_attr('sensor.energi_data_service', 'raw_tomorrow') %}
            
            {% if raw_today %}
              {% for entry in raw_today %}
                {% set entry_hour = entry.hour | as_datetime | as_local %}
                {% if entry_hour.hour >= current_hour and entry_hour.hour < current_hour + 6 %}
                  {% if entry.price < ns.min_price %}
                    {% set ns.min_price = entry.price %}
                    {% set ns.min_time = entry_hour.strftime('%H:%M') %}
                  {% endif %}
                {% endif %}
              {% endfor %}
            {% endif %}
            
            {{ ns.min_time }}
        icon: mdi:clock-fast
```

**Note:** Replace `sensor.energi_data_service` and `sensor.your_solar_sensor` with your actual sensor entities.

### Card Configuration

Add the card to your Lovelace dashboard:

```yaml
type: custom:elbot-card
entity: sensor.elbot_recommendation_status
cheapest_entity: sensor.cheapest_upcoming_prices
```

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `entity` | string | **Required** | Main electricity recommendation sensor |
| `cheapest_entity` | string | `sensor.cheapest_upcoming_prices` | Entity with cheapest price data |

## States

The card displays different colors and icons based on the state:

| State | Color | Icon | Description |
|-------|-------|------|-------------|
| **Perfect** | Green | `mdi:cash-multiple` | Low price + high solar production |
| **Good** | Light Green | `mdi:cash-check` | Low price |
| **Caution** | Orange | `mdi:alert` | Price near threshold (±0.5) |
| **Bad** | Red | `mdi:cash-remove` | High price |

## Screenshots

*Add screenshots of your card in different states here*

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
git clone https://github.com/YOUR_USERNAME/elbot-card.git
cd elbot-card
npm install
```

### Development
```bash
npm run watch  # Watch for changes and rebuild
npm run build  # Build for production
npm run lint   # Lint code
npm run format # Format code
```

### Release
```bash
./scripts/release.sh patch  # 1.0.0 -> 1.0.1
./scripts/release.sh minor  # 1.0.0 -> 1.1.0
./scripts/release.sh major  # 1.0.0 -> 2.0.0
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you like this card, consider:
- ⭐ Starring the repository
- ☕ [Buying me a coffee](https://www.buymeacoffee.com/YOUR_USERNAME)
- 🐛 [Reporting issues](https://github.com/YOUR_USERNAME/elbot-card/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Created by [Your Name]

## Changelog

See [Releases](https://github.com/YOUR_USERNAME/elbot-card/releases) for version history.

[releases-shield]: https://img.shields.io/github/release/YOUR_USERNAME/elbot-card.svg
[releases]: https://github.com/YOUR_USERNAME/elbot-card/releases
[license-shield]: https://img.shields.io/github/license/YOUR_USERNAME/elbot-card.svg

# Elbot Card

A custom Home Assistant card for displaying electricity pricing recommendations with solar production awareness.

## Features
- Real-time electricity pricing status
- Solar production monitoring
- Cheapest upcoming price display
- Beautiful gradient backgrounds
- Click to view detailed pricing

## Configuration

```yaml
type: custom:elbot-card
entity: sensor.elbot_recommendation_status
cheapest_entity: sensor.cheapest_upcoming_prices
```

## States

The card displays different colors and icons based on the state:

- **Perfect** - Green: Low price + high solar production
- **Good** - Light Green: Low price
- **Caution** - Orange: Price near threshold
- **Bad** - Red: High price, no solar

## Support

For issues and feature requests, please use the [GitHub repository](https://github.com/YOUR_USERNAME/elbot-card/issues).

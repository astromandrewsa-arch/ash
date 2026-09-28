import useAnimatedNumber from '../../hooks/useAnimatedNumber.js'

/** A number that counts to its new value, briefly highlighted while it changes. */
export default function AnimatedValue({ value, format }) {
  const shown = useAnimatedNumber(value)
  const moving = Math.abs(shown - value) > Math.abs(value) * 0.001
  return <span className={`animated-value${moving ? ' is-moving' : ''}`}>{format(shown)}</span>
}

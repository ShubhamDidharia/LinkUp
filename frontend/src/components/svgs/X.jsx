// Example: Replace X logo with a simple chat/message bubble icon

const XSvg = (props) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M4 19v-2a7 7 0 017-7h2a7 7 0 017 7v2a2 2 0 01-2 2H6a2 2 0 01-2-2z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx={12} cy={10} r={3} stroke="currentColor" strokeWidth={2} />
  </svg>
);

export default XSvg;
export default function Container(props: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={`${props.className || ''} p-3 my-12 max-w-screen-md`} />
  )
}

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

export default useIsMounted

/**
 The error you're encountering is a performance warning from React's modern 
linting rules. It flags that calling setState directly inside a useEffect triggers 
a cascading render: React finishes its initial render, paints to the screen, 
immediately sees the state change from the effect, and forces a second render.
While this pattern is commonly used in Next.js to solve hydration mismatches, 
there is a more efficient and "world-class" way to handle this using the 
useSyncExternalStore API. This API was specifically designed to handle values 
that differ between the server and the client (like "is this component mounted?") 
without the overhead of an effect-driven re-render cycle. */

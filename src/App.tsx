
import './App.css'
import { ModeToggle } from './components/mode-toggle'
import { Button } from './components/ui/button'

function App() {

  return (
    <div className='flex flex-row gap-1 '>

      <Button>Click</Button>

      <ModeToggle />
    </div>
  )
}

export default App

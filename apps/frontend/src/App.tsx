import nrcLogo from '/nrcLogo.svg'
import './App.css'

function App() {

  return (
    <>
      <div>
        <a href="https://www.nrc.no" target="_blank">
          <img src={nrcLogo} className="logo" alt="NRC logo" />
        </a>
      </div>
      <h1>CORE</h1>
    </>
  )
}

export default App

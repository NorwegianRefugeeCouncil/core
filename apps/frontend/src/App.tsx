import { Logo, Text, Box } from '@nrcno/nrc-design-system'
import { Logos } from '@nrcno/nrc-design-system/lib/esm/types/icons';

const App:React.FC = () => (
  <>
    <Box>
      <a href="https://www.nrc.no" target="_blank">
        <Logo height="80px" name={Logos.Horizontal}/>
      </a>
    </Box>
    <Text variant='heading'>
      CORE
    </Text>
  </>
)

export default App;
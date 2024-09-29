import { useState, useEffect } from 'react'
import './styles.css'

import blankConfig from './data/blankConfig'
import Clock from './components/Clock'
import News from './components/News'
import Quote from './components/Quote'
import Stocks from './components/Stocks'
import ToDo from './components/ToDo'
import Weather from './components/Weather'
import ConfigMenu from './components/ConfigMenu'

export default function App() {
  /* Challenge

    Kaydet butonu aslında kullanıcının widget yapılandırmasını kaydetmez. Göreviniz bunu aşağıdaki şekilde düzeltmektir: 

    	1. Kullanıcı kaydet butonuna tıkladığında ve böylece aşağıdaki 35. satırda save fonksiyonunu çağırdığında, widgetConfig state array localStorage'a kaydedilmelidir. 
       
    	2. WidgetConfig state, herhangi bir array kaydedilmişse, önceki adımda localStorage'a kaydedilen array olarak başlatılmalıdır. Aksi takdirde, DEFAULT_CONFIG olarak başlatılmalıdır.  
			 
	Not: Kaydet butonu, save fonksiyonunu çağırmak için zaten ayarlanmıştır. 
              
    Bonus görev: lazy state başlatmasını kullanarak ikinci görevi tamamlayın. 
*/

  const DEFAULT_CONFIG = blankConfig.map((widget) => {
    return { ...widget, positionData: { ...widget.positionData } }
  })
  //ORJ DOKUMANTASYON Lazy initial state= Argüman initialState, ilk render sırasında kullanılan durumdur. Sonraki renderlarda, dikkate alınmaz. İlk durum pahalı bir hesaplamanın sonucuysa, bunun yerine yalnızca ilk render sırasında yürütülecek bir fonksiyon sağlayabilirsiniz :  useState(()=>{ const initialState= someExpensiveComputation(props)  return initialState })
  //Lazy initialization kullanarak widgetConfig'i başlatıyoruz.
  const [widgetConfig, setWidgetConfig] = useState(() => {
    const savedConfig = localStorage.getItem('widgetConfig')
    //localStorage'da 'widgetConfig' key'ine sahip bir veri olup olmadığını kontrol ediyoruz.
    return savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG
    //eğer varsa JSON olarak parse edip state'e alıyoruz, yoksa DEFAULT_CONFIG kullanıyoruz.
  })

  const [saveRequested, setSaveRequested] = useState(false)

  // save fonksiyonu ile widgetConfig'i localStorage'a kaydediyoruz.
  function save() {
    localStorage.setItem('widgetConfig', JSON.stringify(widgetConfig))
    //localStorage'a widgetConfig'i kaydetmek için JSON.stringify kullanıyoruz.
    setSaveRequested(true) // Aşağıdaki 126. satırda yeşil "Kaydedildi" mesajının oluşturulmasına neden olur. State daha sonra 70. satırdaki setTimeout tarafından tekrar false değerine ayarlanır ve mesaj kaldırılır.
  }

  /****** Kodunuzu yukarıya yazın*******************************************************************  
 
 Challenge'ın çözülmesiyle ilgili tüm kodlar yukarıda yer almaktadır. Bu projede bu kod dışında hiçbir şeyin değiştirilmesine veya incelenmesine gerek yok.
    
 Kendi kodunuzu eklemenin yanı sıra, yukarıda widgetConfig state'inin başlatılma biçiminde yalnızca küçük bir değişiklik yapmanız gerekecektir. Bunun dışında, yukarıdaki kodda da herhangi bir değişiklik yapılmasına gerek yok

***************************************************************************************************/

  const widgetComponents = {
    Clock: <Clock />,
    News: <News />,
    Quote: <Quote />,
    Stocks: <Stocks />,
    ToDo: <ToDo />,
    Weather: <Weather />,
  }

  const savedMessage = (
    <div className="saved-message-container">
      <p className="saved-message">Kaydedildi</p>
    </div>
  )

  useEffect(() => {
    if (saveRequested) {
      setTimeout(() => {
        setSaveRequested(false)
      }, 1000)
    }
  }, [saveRequested])

  function dragHandler(e, data) {
    if (e.target.dataset.type !== 'button') {
      setWidgetConfig((prevConfig) => {
        let allConfigs = [...prevConfig]
        let targetConfig = allConfigs.find(
          (widget) => widget.name === data.node.classList[1]
        )
        targetConfig.positionData = {
          ...targetConfig.positionData,
          customPosition: true,
          x: data.x,
          y: data.y,
        }
        return allConfigs
      })
    }
  }

  function getOffset(name) {
    let targetConfig = widgetConfig.find((widget) => widget.name === name)
    if (!targetConfig.positionData.customPosition) {
      return undefined
    } else {
      return { x: targetConfig.positionData.x, y: targetConfig.positionData.y }
    }
  }

  const widgetsToDisplay = widgetConfig
    .filter((widget) => widget.selected)
    .map((widget) => {
      const component = {
        ...widgetComponents[widget.name],
        key: crypto.randomUUID(),
      }
      component.props = {
        ...component.props,
        name: widget.name,
        gridArea: widget.positionData.gridArea,
        getOffset: getOffset,
        dragHandler: dragHandler,
        changeHandler: changeHandler,
      }
      return component
    })

  function changeHandler(event) {
    setWidgetConfig((prevConfig) => {
      return prevConfig.map((widget) => {
        return widget.name === event.target.name
          ? { ...widget, selected: !widget.selected }
          : { ...widget }
      })
    })
  }

  return (
    <div className="wrapper">
      {saveRequested && savedMessage}
      <div className="widget-container">{widgetsToDisplay}</div>
      <ConfigMenu
        stateProps={{ widgetConfig, setWidgetConfig, DEFAULT_CONFIG }}
        changeHandler={changeHandler}
        save={save}
      />
    </div>
  )
}

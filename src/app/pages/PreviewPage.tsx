import store from "store2";
import {useEffect} from "react";
import {createRoot} from "react-dom/client";

function PreviewPage() {
  useEffect(() => {
    const root = createRoot(document.documentElement)
    root.render(<html dangerouslySetInnerHTML={{__html: store.get("task_html")}} />)
  }, [])
}

export default PreviewPage

import React, { useEffect, useState} from 'react'
import plist from 'plist'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import './App.css'


const exportToExcel = (data, fileName) => {
  console.log(data)
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {type: 'application/octet-stream'})
  saveAs(blob, `${fileName}.xlsx`)
}

function App() {
  const [file, setFile] = useState(null)
  const [filename, setFilename] = useState('')
  const [iframeContent, setIframeContent] = useState('')
  const [allowListBookmarks, setAllowListBookmarks] = useState([])
  const plistItemNames = ['URL', 'Title', 'BookmarkPath']

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFilename(file.name)
    if (!file.name.match("^.*.(plist|xml)$")) {
      alert("File is not a plist file!")
      e.target.value = ''
      return
    }
    setFile(file)
    e.target.value = ''
  }
  
  const handleSaveButton = (e) => {
    exportToExcel(allowListBookmarks, filename)
  }

  useEffect(() => {
    if (!file) return
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      const { result } = e.target
      if (result) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(result, 'application/xml')
        const errorNode = doc.querySelector("parsererror")
        if (errorNode) {
          alert('Parsing failed! Please check your plist file. ')
          return
        }
        const plistAsObj = plist.parse(result)
        const allowListBookmarks = plistAsObj.PayloadContent?.[0]?.AllowListBookmarks
        setAllowListBookmarks(allowListBookmarks)
        setIframeContent(`<textarea style="width: 480px; height: 120px; outline: 1px solid red; border: 0; padding: 10px;">${doc.documentElement.outerHTML}</textarea>`)
      }
    }
    fileReader.readAsText(file)
    return () => {}
  }, [file])

  return (
    <div className="App">
      <div className="App-header pt-4">
        <h1 className="text-3xl font-bold mb-4">
          plist-to-xls converter
        </h1>
        <div>
          <form>
            <p>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept=".plist,.xml"
                className='inputfile rounded-lg'
              />
              <label for="file"><strong>Upload plist file</strong></label>
            </p>
          </form>
          <button
            type="button"
            class="mt-4 text-white bg-blue-700 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            disabled={allowListBookmarks.length === 0}
            onClick={handleSaveButton}
          >
              Save as Excel file
          </button>
        </div>
        <hr />
        <div className='mt-4'>
          <p>
            <strong>Filename:</strong> {filename}
          </p>
        </div>
        <div>
          <iframe title="filecontent" srcDoc={iframeContent} />
        </div>
        <div>
          {allowListBookmarks.length > 0 && (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <h2 className='m-4'>AllowListBookmarks</h2>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    {plistItemNames.map((itemName, index) => (
                      <th key={index} scope="col" className="px-6 py-3">{itemName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allowListBookmarks.map((bookmark, index) => (
                    <tr key={`td_${index}`} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      {plistItemNames.map((itemName, index2) => (
                        <td key={`td_${index2}`} className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{bookmark[itemName]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

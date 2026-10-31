Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentDir

' Launch node start.js completely in background with no terminal window (0 = hidden)
WshShell.Run "cmd /c node start.js", 0, False

' Wait 2.5 seconds for servers to initialize, then launch the browser
WScript.Sleep 2500
WshShell.Run "http://localhost:5174", 1, False

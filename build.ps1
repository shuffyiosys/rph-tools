md -Force .\output | Out-Null
 Get-Content  .\src\header.js,`
              .\src\utilities.js,`
              .\src\custom.js,`
              .\src\feature-modules\chat.js,`
              .\src\feature-modules\pm.js,`
              .\src\feature-modules\modding.js,`
              .\src\feature-modules\log-manager.js +^
              .\src\core-modules\settings.js,`
              .\src\core-modules\about.js,`
              .\src\core-modules\rph-tools.js,`
              .\src\main.js  | Out-File .\output\rph-tools-app.js
# Troubleshooting
- Make sure you are using **one version** of this script.
- After installing or updating the script, refresh RPH.
- If your settings are out of whack...
    - Open up your browser's JavaScript console. In Firefox, either press F12 to bring up the developer's window and select the "Console" tab or go to Options > Developer > Web Console. In Chrome, either do CTRL (Command on Mac) + Shift + J or go to View > Developer > JavaScript Console.
    - Issue the command ```localStorage.removeItem('rph_tools_settings');```
    - Issue the command ```localStorage.getItem('rph_tools_settings');``` and verify the console responds with ```null```

- Note that the script has some print-outs on the console. They may be helpful in asking for help
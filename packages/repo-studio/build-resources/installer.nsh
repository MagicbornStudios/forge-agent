!macro customInit
  ${If} $installMode == "CurrentUser"
    ${If} $INSTDIR == "$LocalAppData\Programs\@forgerepo-studio"
      StrCpy $INSTDIR "$LocalAppData\Programs\RepoStudio"
    ${EndIf}
  ${Else}
    ${If} $INSTDIR == "$PROGRAMFILES\@forgerepo-studio"
      StrCpy $INSTDIR "$PROGRAMFILES\RepoStudio"
    ${EndIf}
    ${If} ${RunningX64}
      ${If} $INSTDIR == "$PROGRAMFILES64\@forgerepo-studio"
        StrCpy $INSTDIR "$PROGRAMFILES64\RepoStudio"
      ${EndIf}
    ${EndIf}
  ${EndIf}
!macroend

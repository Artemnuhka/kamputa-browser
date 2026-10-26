/* SPDX-License-Identifier: MPL-2.0 */
import {argbFromHex,hexFromArgb} from './material/utils/string_utils.js';
import {Hct} from './material/hct/hct.js';
import {SchemeTonalSpot} from './material/scheme/scheme_tonal_spot.js';
import {MaterialDynamicColors as M} from './material/dynamiccolor/material_dynamic_colors.js';
export function palette(seed){
 if(!seed)return {frame:'#282a31',surface:'#2c2f36',page:'#202228',field:'#393b42',selected:'#393b42',text:'#e2e2ea',muted:'#abb2c2',accent:'#aec7fa',onAccent:'#152741',accentContainer:'#3a4357',onAccentContainer:'#cbdcfa',border:'#41454f',hover:'#434750',active:'#4b5160',link:'#b7cdf5'};
 if(!/^#[0-9a-f]{6}$/i.test(seed))throw new Error('Нужен цвет в формате #RRGGBB');
 const s=new SchemeTonalSpot(Hct.fromInt(argbFromHex(seed)),true,0);
 const c=k=>hexFromArgb(M[k].getArgb(s));
 return {frame:c('surfaceContainerLow'),surface:c('surfaceContainer'),page:c('surface'),field:c('surfaceContainerHigh'),selected:c('surfaceContainerHighest'),text:c('onSurface'),muted:c('onSurfaceVariant'),accent:c('primary'),onAccent:c('onPrimary'),accentContainer:c('primaryContainer'),onAccentContainer:c('onPrimaryContainer'),border:c('outlineVariant'),hover:c('surfaceContainerHighest'),active:c('secondaryContainer'),link:c('primary')};
}
export function themeColors(p){return {frame:p.frame,frame_inactive:p.frame,tab_background_text:p.muted,tab_selected:p.selected,tab_text:p.text,tab_line:p.selected,toolbar:p.frame,toolbar_text:p.text,toolbar_bottom_separator:p.frame,toolbar_top_separator:p.frame,toolbar_vertical_separator:p.border,toolbar_field:p.field,toolbar_field_text:p.text,toolbar_field_border:p.field,toolbar_field_focus:p.field,toolbar_field_text_focus:p.text,toolbar_field_border_focus:p.field,toolbar_field_highlight:p.accentContainer,toolbar_field_highlight_text:p.onAccentContainer,popup:p.surface,popup_text:p.text,popup_border:p.border,popup_highlight:p.hover,popup_highlight_text:p.text,sidebar:p.surface,sidebar_text:p.text,sidebar_border:p.border,icons:p.muted,icons_attention:p.accent,button_background_hover:p.hover,button_background_active:p.active,ntp_background:p.page,ntp_text:p.text};}

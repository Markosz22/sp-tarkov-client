import { inject, Injectable } from '@angular/core';
import { from, map, mergeMap, Observable, toArray } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HtmlHelper } from '../helper/html-helper';
import { Mod } from '../models/mod';
import { Kind } from '../../../../shared/models/unzip.model';
import { environment } from '../../../environments/environment';
import { FileHelper } from '../helper/file-helper';
import { ConfigurationService } from './configuration.service';

interface SearchResponse {
  template: string;
}

@Injectable({
  providedIn: 'root',
})
export class AkiSearchService {
  private restrictedModKinds = ['Community support'];

  #httpClient = inject(HttpClient);
  #configurationService = inject(ConfigurationService);
  modSearchUrl = environment.production ? 'https://hub.sp-tarkov.com/files/extended-search/' : '/files/extended-search/';
  #placeholderImagePath = 'assets/images/placeholder.png';

  searchMods(searchArgument: string): Observable<Mod[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });

    return this.#httpClient
      .post<SearchResponse>(
        this.modSearchUrl,
        `searchString=${searchArgument}&searchParameters[0][name]=types[]&searchParameters[0][value]=everywhere`,
        { headers: headers }
      )
      .pipe(
        map(response => this.extractModInformation(response)),
        mergeMap((mods: Mod[]) => from(mods)),
        mergeMap(mod =>
          this.getFileHubView(mod.fileUrl).pipe(
            map(({ supportedAkiVersion, akiVersionColorCode }) => ({ ...mod, supportedAkiVersion, akiVersionColorCode }))
          )
        ),
        toArray()
      );
  }

  private extractModInformation(searchResponse: SearchResponse): Mod[] {
    const searchResult = HtmlHelper.parseStringAsHtml(searchResponse.template);
    const modListSection = searchResult.body?.querySelectorAll('.section:nth-child(2) div.sectionTitle + ul .extendedNotificationItem');
    const config = this.#configurationService.configSignal();

    if (!modListSection) {
      return [];
    }

    return Array.from(modListSection)
      .map(e => {
        const rawKind = e.getElementsByClassName('extendedNotificationSubtitle')?.[0].getElementsByTagName('small')?.[0].innerHTML;
        let kind: Kind | undefined;
        if (rawKind.startsWith('Client mods')) {
          kind = Kind.client;
        } else if (rawKind.startsWith('Server mods')) {
          kind = Kind.server;
        } else if (rawKind.startsWith('Overhaul')) {
          kind = Kind.overhaul;
        }

        return {
          name: e.getElementsByClassName('extendedNotificationLabel')?.[0]?.innerHTML,
          image: e.getElementsByTagName('img')?.[0]?.src ?? this.#placeholderImagePath,
          fileUrl: e.getElementsByTagName('a')?.[0]?.href,
          kind: kind,
        } as Mod; // Type assertion here
      })
      .filter(m => m.kind !== undefined && !this.restrictedModKinds.some(r => m.kind?.includes(r)))
      .map(e => {
        if (!config) {
          return e;
        }

        const fileId = FileHelper.extractFileIdFromUrl(e.fileUrl);
        if (!fileId) {
          return e;
        }

        e.notSupported = !!config.notSupported.find(f => f === +fileId);
        return e;
      });
  }

  private getFileHubView(modUrl: string): Observable<{ supportedAkiVersion: string; akiVersionColorCode: string }> {
    modUrl = environment.production ? modUrl : modUrl.replace('https://hub.sp-tarkov.com/', '');
    return this.#httpClient.get(modUrl, { responseType: 'text' }).pipe(map(modView => this.extractSPVersion(modView)));
  }

  private extractSPVersion(modHub: string): { supportedAkiVersion: string; akiVersionColorCode: string } {
    const searchResult = HtmlHelper.parseStringAsHtml(modHub);

    return {
      supportedAkiVersion: searchResult.getElementsByClassName('labelList')[0]?.getElementsByClassName('badge label')[0]?.innerHTML ?? '',
      akiVersionColorCode: searchResult.getElementsByClassName('labelList')[0]?.getElementsByClassName('badge label')[0]?.className,
    };
  }
}

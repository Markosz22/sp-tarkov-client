import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { GitHubReleaseItem } from '../models/github.model'

@Injectable()
export class GithubService {
  #httpClient = inject(HttpClient)

  getGitHubReleaseList(ownerName: string, repoName: string): Observable<GitHubReleaseItem[]> {
    return this.#httpClient.get<GitHubReleaseItem[]>(`https://api.github.com/repos/${ownerName}/${repoName}/releases`)
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'csd-public-toolbar',
  templateUrl: './csd-public-toolbar.component.html',
  styleUrls: ['./csd-public-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdPublicToolbarComponent implements OnInit {
  logoImage = '/assets/images/logo_rect_dark.svg';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: { logoImage: string }) => {
      this.logoImage = data.logoImage;
    });
  }
}

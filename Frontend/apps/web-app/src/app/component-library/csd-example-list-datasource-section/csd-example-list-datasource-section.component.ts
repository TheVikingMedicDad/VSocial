import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CsdListDataSource } from '../../shared/datasource/csd-list-data-source';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'csd-example-list-datasource-section',
  templateUrl: './csd-example-list-datasource-section.component.html',
  styleUrls: ['./csd-example-list-datasource-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdExampleListDatasourceSectionComponent implements OnInit {
  dataSource: CsdListDataSource<Item>;
  columnsToDisplay = ['id', 'name', 'email', 'actions'];
  data: Item[];

  addForm: FormGroup;

  showList = false;

  constructor(private formBuilder: FormBuilder) {
    this.data = Array(20)
      .fill(0)
      .map((key, i) => ({
        id: 20 - i,
        name: 'blub',
        email: `test${i}@cnc.io`,
      }));
    this.dataSource = new CsdListDataSource<Item>(this.data);

    this.addForm = formBuilder.group({
      name: formBuilder.control('', [Validators.required]),
      email: formBuilder.control('', [Validators.min(3)]),
    });
  }

  ngOnInit() {}

  toggleShowList() {
    this.showList = !this.showList;
  }

  saveItem() {
    if (!this.addForm.value) return;
    this.data = [
      {
        id: this.data.length > 0 ? this.data[0].id + 1 : 1,
        name: this.addForm.get('name').value,
        email: this.addForm.get('email').value,
      },
      ...this.data,
    ];
    this.dataSource.setData(this.data);
    this.addForm.setValue({ name: '', email: '' });
  }

  deleteItem(itemId: number) {
    this.data = this.data.filter((x) => itemId != x.id);
    this.dataSource.setData(this.data);
  }
}

interface Item {
  id;
  name;
  email;
}

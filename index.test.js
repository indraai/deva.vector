"use strict";
// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:38376038300534627638 LICENSE.md
// Indra Deva test file

const {expect} = require('chai')
const :key: = require('./index.js');

describe(indra.me.name, () => {
  beforeEach(() => {
    return indra.init()
  });
  it('Check the DEVA Object', () => {
    expect(indra).to.be.an('object');
    expect(indra).to.have.property('agent');
    expect(indra).to.have.property('vars');
    expect(indra).to.have.property('listeners');
    expect(indra).to.have.property('methods');
    expect(indra).to.have.property('modules');
  });
})

"use strict";
// Copyright ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:31941953695116752336 LICENSE.md
// Vector  Deva test file

const {expect} = require('chai')
const vector = require('./index.js');

describe(indra.me.name, () => {
  beforeEach(() => {
    return vector.init()
  });
  it('Check the DEVA Object', () => {
    expect(vector).to.be.an('object');
    expect(vector).to.have.property('agent');
    expect(vector).to.have.property('vars');
    expect(vector).to.have.property('listeners');
    expect(vector).to.have.property('methods');
    expect(vector).to.have.property('modules');
  });
})
